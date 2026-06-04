"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Consultation {
  id: string;
  title: string;
  date: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  source: "TEXT" | "VOICE";
  summary: string;
  messages: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Demo data
  const consultations: Consultation[] = [
    {
      id: "1",
      title: "Headache and Fever",
      date: "2026-05-25",
      riskLevel: "LOW",
      source: "TEXT",
      summary: "Patient reported headache and mild fever. AI suggested rest and hydration.",
      messages: 6,
    },
    {
      id: "2",
      title: "Back Pain Consultation",
      date: "2026-05-24",
      riskLevel: "MEDIUM",
      source: "VOICE",
      summary: "Lower back pain for 3 days. AI recommended physiotherapy and pain relief.",
      messages: 8,
    },
    {
      id: "3",
      title: "Chest Pain — Emergency",
      date: "2026-05-23",
      riskLevel: "EMERGENCY",
      source: "TEXT",
      summary: "Patient reported chest pain. AI flagged as emergency and recommended immediate care.",
      messages: 4,
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "EMERGENCY": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "HIGH": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "EMERGENCY": return "🔴 Emergency";
      case "HIGH": return "🟠 High";
      case "MEDIUM": return "🟡 Medium";
      default: return "🟢 Low";
    }
  };

  const filtered = consultations.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || c.riskLevel === filter;
    return matchSearch && matchFilter;
  });

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
          <span>📋</span>
        </div>
        <div>
          <h1 className="text-white font-bold">Consultation History</h1>
          <p className="text-teal-400 text-xs">All your past consultations</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search consultations..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors text-sm"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🟠 High</option>
            <option value="EMERGENCY">🔴 Emergency</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: consultations.length, color: "teal" },
            { label: "Emergency", value: consultations.filter(c => c.riskLevel === "EMERGENCY").length, color: "red" },
            { label: "Voice", value: consultations.filter(c => c.source === "VOICE").length, color: "blue" },
            { label: "This Week", value: consultations.length, color: "green" },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Consultation List */}
        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400">No consultations found</p>
            <button
              onClick={() => router.push("/chat")}
              className="mt-4 bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Start Consultation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <div
                key={c.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-teal-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-white font-bold group-hover:text-teal-400 transition-colors">
                        {c.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskBadge(c.riskLevel)}`}>
                        {getRiskLabel(c.riskLevel)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 text-gray-400">
                        {c.source === "VOICE" ? "🎤 Voice" : "💬 Text"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{c.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {new Date(c.date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>💬 {c.messages} messages</span>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-teal-400 transition-colors text-lg flex-shrink-0">
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}