"use client";
import React, { useState } from "react";

type CandidateResult = {
  candidate: {
    id: string;
    name: string;
  };
  score: number;
  scorePct: number;
  chunk: string;
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
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("jd", jd);
    try {
      const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResults(data.ranked || []);
      if (data.ranked && data.ranked.length > 0) {
        const total = data.ranked.length;
        const avg: number = data.ranked.reduce((acc: number, c: CandidateResult) => acc + c.scorePct, 0) / total;
        const top: number = Math.max(...data.ranked.map((c: CandidateResult) => c.scorePct));
        const above70: number = data.ranked.filter((c: CandidateResult) => c.scorePct >= 70).length;
        setSummary({ total, avg, top, above70 });
      } else {
        setSummary(null);
      }
    } catch (err) {
      alert("Error analyzing resumes");
    }
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 60) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              AI Resume Analyzer
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Upload resumes and get AI-powered matching scores against your job description. 
              Find the perfect candidates in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-8 mb-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Resumes</h3>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">PDF, DOC, DOCX, TXT, RTF, ODT</p>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {files.length} file{files.length > 1 ? 's' : ''} selected:
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Job Description</h3>
              </div>
              
              <textarea
                className="w-full h-40 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste your job description here. Include key skills, requirements, and qualifications you're looking for..."
              />
              
              {jd && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {jd.length} characters • {jd.split(' ').length} words
                </div>
              )}
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center mt-8">
            <button
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              onClick={handleAnalyze}
              disabled={loading || !jd || files.length === 0}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Resumes...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Resumes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-8 mb-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.total}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">Total Candidates</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.avg.toFixed(1)}%</div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mt-1">Average Score</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.top.toFixed(1)}%</div>
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-1">Top Score</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{summary.above70}</div>
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mt-1">Above 70%</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Candidate Rankings</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Candidate</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">Match Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">Raw Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Key Highlights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {results.map((candidate, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-semibold text-slate-900 dark:text-white text-lg">
                          {candidate.candidate.name}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getScoreBadgeColor(candidate.scorePct)}`}>
                          {candidate.scorePct.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="text-slate-600 dark:text-slate-400 font-medium">
                          {candidate.score.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                          <p className="line-clamp-3 leading-relaxed">
                            {candidate.chunk}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
