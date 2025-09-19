# Resume Analyzer Monorepo

A full-stack AI-powered Resume Analyzer that matches candidate resumes to job descriptions using embeddings, vector search, and LLMs. Built with Node.js (Express), Next.js (React), and Tailwind CSS.

## Features

- **Multi-format Resume Upload:** PDF, DOCX, DOC, TXT, RTF, ODT
- **Job Description Matching:** Paste or type a JD, analyze all uploaded resumes
- **Embeddings & Vector Search:** Uses OpenAI embeddings for semantic matching
- **Scoring & Ranking:** Cosine similarity, candidate ranking, analysis summary
- **Beautiful UI:** Responsive, modern design with Tailwind CSS
- **Monorepo Structure:** Backend (Express) and Frontend (Next.js) in one repo

## Project Structure

```
resume-analyzer-node/
├── backend/         # Node.js Express API
│   ├── index.ts     # Main API server
│   ├── upload.ts    # File upload endpoint
│   └── ...
├── web/             # Next.js 14 frontend
│   ├── app/         # App directory (pages, layout, styles)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── ...
├── README.md        # Project documentation
└── ...
```

## Getting Started

### 1. Install dependencies

From the project root:
```sh
npm install
```

### 2. Start the backend

```sh
npm run dev --workspace backend
```

- Backend runs on `http://localhost:3000`
- Requires `.env` file with your OpenAI API key:
  ```env
  OPENAI_API_KEY=sk-...
  ```

### 3. Start the frontend

```sh
npm run dev --workspace web
```

- Frontend runs on `http://localhost:3001` (or default Next.js port)

### 4. Usage

- Upload multiple resumes (PDF, DOCX, DOC, TXT, etc.)
- Paste or type a Job Description
- Click **Analyze** to see:
  - 📊 Analysis Summary (Total Candidates, Average Score, Top Score, Above 70%)
  - 🏆 Candidate Rankings (name, score, snippet)

## Tech Stack

- **Backend:** Node.js, Express, OpenAI, textract, multer
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Embeddings:** OpenAI `text-embedding-ada-002`
- **Vector Search:** In-memory (MVP), can be extended to Pinecone/Qdrant

## Customization & Extensibility

- Add support for more resume formats or external vector DBs
- Integrate LLMs for candidate fit explanations
- Enhance dashboard with charts, filters, and recruiter tools

## License

MIT

---

**Made with ❤️ by Gaurav(itsmegc)**
