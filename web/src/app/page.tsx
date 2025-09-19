

"use client";
import React, { useState } from "react";

type CandidateResult = {
  name: string;
  score: number;
  snippet: string;
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    avg: number;
    top: number;
    above70: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (!jd || files.length === 0) return;
    setLoading(true);
    // FormData for upload
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("jd", jd);
    try {
      const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data.rankings || []);
      setSummary(data.summary || null);
    } catch (err) {
      alert("Error analyzing resumes");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Resume Analyzer</h1>
      <div className="w-full max-w-xl bg-white dark:bg-[#181818] rounded-xl shadow-lg p-8 mb-8">
        <label className="block mb-4 font-medium">Upload Resumes</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
          className="block w-full mb-6 border border-gray-300 rounded px-3 py-2"
          onChange={handleFileChange}
        />
        <label className="block mb-2 font-medium">Job Description</label>
        <textarea
          className="block w-full mb-6 border border-gray-300 rounded px-3 py-2 min-h-[100px]"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste or type the job description here..."
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={loading || !jd || files.length === 0}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {summary && (
        <div className="w-full max-w-xl bg-white dark:bg-[#181818] rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📊 Analysis Summary</h2>
          <ul className="mb-2 text-base">
            <li>Total Candidates: {summary.total}</li>
            <li>Average Score: {summary.avg.toFixed(2)}</li>
            <li>Top Score: {summary.top.toFixed(2)}</li>
            <li>Above 70%: {summary.above70}</li>
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="w-full max-w-xl bg-white dark:bg-[#181818] rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Candidate Rankings</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Score</th>
                <th className="py-2">Snippet</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-semibold">{c.name}</td>
                  <td className="py-2">{c.score.toFixed(2)}</td>
                  <td className="py-2 text-sm">{c.snippet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
