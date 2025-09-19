import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
// ...existing code...
import uploadRouter from "./upload";
import OpenAI from "openai";
import textract from "textract";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// File upload API
app.use("/api", uploadRouter);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Utility: Extract text from any supported resume file
function extractResumeText(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (error: Error | null, text: string | undefined) => {
      if (error || !text) return reject(error || new Error("No text extracted"));
      resolve(text);
    });
  });
}

// Utility: Chunk text
function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks;
}

// Utility: Get embedding from OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding as number[];
}

// Candidate type
interface Candidate {
  id: string;
  name?: string;
}

// Vector store entry
interface VectorEntry {
  embedding: number[];
  chunk: string;
  candidate: Candidate;
}

// In-memory vector store
const vectorStore: VectorEntry[] = [];

// API: Upload resume (PDF/DOCX)
app.post("/upload", async (req: Request, res: Response) => {
  // For API integration, expects { filePath, candidate } from upload API
  const { filePath, candidate } = req.body as {
    filePath: string;
    candidate: Candidate;
  };
  // Validate file exists
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ error: "File not found" });
  }
  let text = "";
  try {
    text = await extractResumeText(filePath);
  } catch (err) {
    return res.status(500).json({ error: "Failed to extract text", details: String(err) });
  }
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    vectorStore.push({ embedding, chunk, candidate });
  }
  res.json({ message: "Resume processed", chunks: chunks.length });
});

// API: Analyze JD and rank candidates
app.post("/analyze", async (req: Request, res: Response) => {
  const { jobDescription } = req.body as { jobDescription: string };
  const jdEmbedding = await getEmbedding(jobDescription);

  // Cosine similarity function
  function cosine(a: number[], b: number[]): number {
    let dot = 0,
      normA = 0,
      normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Score each candidate by max cosine similarity
  const scores: {
    [id: string]: { score: number; candidate: Candidate; chunk: string };
  } = {};

  for (const entry of vectorStore) {
    const score = cosine(jdEmbedding, entry.embedding);
    const id = entry.candidate.id;
    if (!scores[id] || score > scores[id].score) {
      scores[id] = { score, candidate: entry.candidate, chunk: entry.chunk };
    }
  }

  // Normalize and rank
  const ranked = Object.values(scores)
    .map((e) => ({
      ...e,
      scorePct: Math.round((e.score - 0) / (1 - 0) * 100), // 0–100 scale
    }))
    .sort((a, b) => b.scorePct - a.scorePct);

  res.json({ ranked });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
