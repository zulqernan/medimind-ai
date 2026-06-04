"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [reportLanguage, setReportLanguage] = useState<"en" | "ur">("en");
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleFile = (selectedFile: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(selectedFile.type)) {
      setError("Only JPG, PNG, WEBP or PDF files allowed!");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB!");
      return;
    }
    setFile(selectedFile);
    setError("");
    setAnalysis("");

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("pdf");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const analyzeReport = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError("");
    setAnalysis("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("language", reportLanguage);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed!");
      } else {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      setError("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h3 key={i} className="text-teal-400 font-bold text-base mt-4 mb-2">{line.replace(/\*\*/g, "")}</h3>;
      }
      if (line.includes("**")) {
        return <p key={i} className="text-gray-200 text-sm mb-1" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        }} />;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <li key={i} className="text-gray-300 text-sm ml-4 mb-1 list-disc">{line.slice(2)}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-gray-300 text-sm mb-1">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <span>📄</span>
        </div>
        <div>
          <h1 className="text-white font-bold">Lab Report Analyzer</h1>
          <p className="text-teal-400 text-xs">AI-powered medical report analysis</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Upload Area */}
        {!analysis && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
              dragOver
                ? "border-teal-400 bg-teal-500/10"
                : file
                ? "border-teal-500/50 bg-teal-500/5"
                : "border-gray-700 hover:border-teal-500/50 hover:bg-gray-900/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-4">
                {preview === "pdf" ? (
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-3xl">📄</div>
                ) : (
                  <img src={preview} alt="preview" className="max-h-48 rounded-xl object-contain" />
                )}
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <p className="text-teal-400 text-sm">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-5xl">🔬</div>
                <div>
                  <p className="text-white font-medium text-lg">Upload Lab Report</p>
                  <p className="text-gray-400 text-sm mt-1">Drag & drop or click to upload</p>
                  <p className="text-gray-600 text-xs mt-2">Supports: JPG, PNG, WEBP, PDF • Max 10MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
{/* Language Toggle */}
{file && !analysis && (
  <div className="flex justify-center mb-4">
    <div className="flex bg-gray-800 rounded-xl p-1">
      <button
        onClick={() => setReportLanguage("en")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          reportLanguage === "en"
            ? "bg-teal-500 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        English
      </button>
      <button
        onClick={() => setReportLanguage("ur")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          reportLanguage === "ur"
            ? "bg-teal-500 text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        Roman Urdu
      </button>
    </div>
  </div>
)}
        {/* Analyze Button */}
        {file && !analysis && (
          <button
            onClick={analyzeReport}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors text-lg mb-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing Report...
              </span>
            ) : "🔬 Analyze Report"}
          </button>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-xl">🔬</div>
                <div>
                  <h2 className="text-white font-bold">Analysis Complete</h2>
                  <p className="text-gray-400 text-xs">{file?.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setAnalysis(""); setFile(null); setPreview(""); }}
                className="text-gray-400 hover:text-white text-sm bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                New Report
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              {formatAnalysis(analysis)}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-yellow-400 text-xs">
                ⚠️ This is an AI-generated analysis for informational purposes only. 
                Always consult a qualified healthcare provider for medical advice and diagnosis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}