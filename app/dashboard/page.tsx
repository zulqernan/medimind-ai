"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { icon: "🏠", label: "Dashboard", path: "/dashboard" },
  { icon: "🧠", label: "AI Health Chat", path: "/chat" },
  { icon: "🎤", label: "Voice Assistant", path: "/voice" },
  { icon: "📄", label: "Lab Reports", path: "/reports" },
  { icon: "📋", label: "History", path: "/history" },
  { icon: "👤", label: "Profile", path: "/profile" },
  { icon: "⚙️", label: "Settings", path: "/settings" },
];

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(userData);
    setUser(u);

    // First time login welcome
    const isFirstTime = !localStorage.getItem("welcomed");
    if (isFirstTime) {
      setShowWelcome(true);
      // Welcome voice greeting
setTimeout(() => {
  const greeting = `Welcome ${u.name}! I am MediMind AI, your personal health assistant. How can I help you today?`;
  const utterance = new SpeechSynthesisUtterance(greeting);
  utterance.rate = 1.0;
  utterance.pitch = 1.3;
  utterance.lang = "en-US";
  
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.name.includes("Google UK English Female") ||
      v.name.includes("Microsoft Zira") ||
      v.name.includes("Samantha") ||
      v.name.includes("Karen")
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }
}, 500);
      localStorage.setItem("welcomed", "true");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-teal-400 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-teal-500/30 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              MediMind AI is your personal health assistant. I can help you with:
            </p>
            <div className="space-y-3 mb-6 text-left">
              {[
                { icon: "🧠", text: "Describe symptoms and get AI health guidance" },
                { icon: "🎤", text: "Voice consultation in English or Urdu" },
                { icon: "📄", text: "Upload and analyze your lab reports" },
                { icon: "🚨", text: "Emergency detection and alerts" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-yellow-400 text-xs mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              ⚠️ MediMind AI is not a licensed doctor. Always consult a real healthcare provider.
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Get Started 🚀
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span className="text-white font-bold text-sm">MediMind AI</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left ${
                pathname === item.path
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-800">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-800 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                <p className="text-teal-400 text-xs">{user?.plan} Plan</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("welcomed");
                router.push("/login");
              }}
              className="w-full mt-2 text-gray-400 hover:text-red-400 text-xs py-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-400 text-sm">Your AI Health Assistant is ready</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-full px-3 py-1">
              <span className="text-teal-400 text-xs font-medium">{user?.plan} Plan</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Consultations", value: "0", icon: "🧠" },
              { label: "Lab Reports", value: "0", icon: "📄" },
              { label: "Reminders", value: "0", icon: "⏰" },
              { label: "Health Score", value: "—", icon: "❤️" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-teal-500/30 transition-colors">
                <div className="text-2xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🧠", title: "AI Health Chat", desc: "Describe symptoms, get AI guidance", path: "/chat" },
              { icon: "🎤", title: "Voice Assistant", desc: "Talk to AI about your health", path: "/voice" },
              { icon: "📄", title: "Lab Reports", desc: "Upload and analyze lab reports", path: "/reports" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-teal-500/50 transition-all hover:scale-[1.02] text-left group"
              >
                <div className="text-3xl mb-4">{action.icon}</div>
                <h3 className="text-white font-bold mb-2 group-hover:text-teal-400 transition-colors">{action.title}</h3>
                <p className="text-gray-400 text-sm">{action.desc}</p>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <h2 className="text-white font-bold text-lg mb-4">Recent Activity</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400">No recent activity yet</p>
            <p className="text-gray-600 text-sm mt-1">Start a consultation to see your history here</p>
            <button
              onClick={() => router.push("/chat")}
              className="mt-4 bg-teal-500 hover:bg-teal-400 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Start Consultation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}