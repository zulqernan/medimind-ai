"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VoicePage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Hello! I am MediMind AI 🎤 Aap English ya Urdu mein bol sakte hain. Mic button dabayein aur apni takleef batayein!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Chrome browser use karein — voice support ke liye!");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "ur" ? "ur-PK" : "en-US";

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interim);
    };

    recognition.onend = async () => {
      setIsListening(false);
      const textToSend = finalTranscript || transcript;
      if (textToSend.trim()) {
        await sendVoiceMessage(textToSend.trim());
        setTranscript("");
        finalTranscript = "";
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      console.error("Speech error:", event.error);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

 const speakResponse = async (text: string) => {
    try {
      window.speechSynthesis.cancel();
      
      const res = await fetch("/api/voice-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.playbackRate = 1.0;
      await audio.play();

    } catch (error) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.3;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };
  const sendVoiceMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.id,
          language,
        }),
      });

      const data = await res.json();
      const aiResponse = data.message || data.error || "Kuch masla ho gaya, dobara try karein!";

      setMessages([...newMessages, { role: "assistant", content: aiResponse }]);
      speakResponse(aiResponse);

    } catch (error) {
      const errMsg = "Kuch masla ho gaya. Dobara try karein!";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span>🎤</span>
          </div>
          <div>
            <h1 className="text-white font-bold">Voice Assistant</h1>
            <p className="text-teal-400 text-xs">English & Urdu supported</p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              language === "en"
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("ur")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              language === "ur"
                ? "bg-teal-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            اردو
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
              msg.role === "assistant" ? "bg-teal-500" : "bg-gray-700"
            }`}>
              {msg.role === "assistant" ? "🎤" : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "assistant"
                ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                : "bg-teal-500 text-white rounded-tr-sm"
            }`}
            style={{ direction: language === "ur" ? "rtl" : "ltr" }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-sm">🎤</div>
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mx-4 mb-2 bg-gray-800 border border-teal-500/30 rounded-xl px-4 py-2">
          <p className="text-teal-300 text-sm italic">"{transcript}"</p>
        </div>
      )}

      {/* Voice Button */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          {/* Visualizer */}
          <div className="flex gap-1 h-8 items-center">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isListening ? "bg-teal-400" : "bg-gray-700"
                }`}
                style={{
                  height: isListening ? `${Math.random() * 24 + 8}px` : "8px",
                  animation: isListening ? `bounce ${0.5 + i * 0.1}s infinite alternate` : "none"
                }}
              />
            ))}
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
              isListening
                ? "bg-red-500 hover:bg-red-400 animate-pulse shadow-2xl shadow-red-500/50 scale-110"
                : "bg-teal-500 hover:bg-teal-400 shadow-2xl shadow-teal-500/50 hover:scale-105"
            } disabled:opacity-50`}
          >
            {isListening ? "⏹" : "🎤"}
          </button>

          <p className="text-gray-400 text-sm font-medium">
            {isListening
              ? (language === "ur" ? "سن رہا ہوں... رکنے کے لیے دبائیں" : "Listening... tap to stop")
              : loading
              ? (language === "ur" ? "سوچ رہا ہوں..." : "Processing...")
              : (language === "ur" ? "بولنے کے لیے دبائیں" : "Tap to speak")}
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          MediMind AI licensed doctor nahi hai — hamesha real doctor se milein
        </p>
      </div>
    </div>
  );
}