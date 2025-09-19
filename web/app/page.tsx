"use client";
import React, { useState } from "react";

interface Candidate {
  id: string;
  name?: string;
  scorePct: number;
  chunk: string;
}

export default function Home() {
  const [jd, setJd] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState<{ total: number; avg: number; top: number; above70: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (!jd || files.length === 0) return;
    setLoading(true);
    // Upload resumes and process each
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      // Upload file to backend
      const uploadRes = await fetch("http://localhost:3000/api/file", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.filePath) continue;
      // Send filePath and candidate info to /upload
      await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: uploadData.filePath, candidate: { id: file.name, name: file.name } }),
      });
    }
    // Analyze JD
    const res = await fetch("http://localhost:3000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jd }),
    });
    const data = await res.json();
    setCandidates(data.ranked);
    // Summary
    const scores = data.ranked.map((c: Candidate) => c.scorePct);
    setSummary({
      total: data.ranked.length,
      avg: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1)),
      top: Math.max(...scores),
      above70: data.ranked.filter((c: Candidate) => c.scorePct >= 70).length,
    });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Resume Analyzer</h1>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Upload Resumes (PDF, DOCX, DOC, TXT):</label>
          <input type="file" multiple onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt,.rtf,.odt" className="mb-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Job Description:</label>
          <textarea value={jd} onChange={e => setJd(e.target.value)} rows={4} className="w-full border rounded p-2" placeholder="Paste JD here..." />
        </div>
        <button onClick={handleAnalyze} disabled={loading || !jd || files.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {summary && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">📊 Analysis Summary</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 p-4 rounded">Total Candidates<br /><span className="text-2xl font-bold">{summary.total}</span></div>
              <div className="bg-gray-100 p-4 rounded">Average Score<br /><span className="text-2xl font-bold">{summary.avg}%</span></div>
              <div className="bg-gray-100 p-4 rounded">Top Score<br /><span className="text-2xl font-bold">{summary.top}%</span></div>
              <div className="bg-gray-100 p-4 rounded">Above 70%<br /><span className="text-2xl font-bold">{summary.above70}</span></div>
            </div>
            <h2 className="text-xl font-bold mb-2">🏆 Candidate Rankings</h2>
            <ol className="list-decimal ml-6">
              {candidates.map((c, i) => (
                <li key={c.id} className="mb-2">
                  <span className="font-bold">{c.name}</span> <span className="text-gray-600">({c.scorePct}%)</span>
                  <div className="text-xs text-gray-500">Snippet: {c.chunk.slice(0, 100)}...</div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
