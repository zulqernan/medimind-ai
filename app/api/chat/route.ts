import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Simple in-memory rate limiter
const requestTimestamps: number[] = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 8;

function checkRateLimit(): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  const recentRequests = requestTimestamps.filter(t => t > windowStart);
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentRequests);
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) return false;
  requestTimestamps.push(now);
  return true;
}

// Truncate conversation to last 4 messages to save tokens
function truncateMessages(messages: any[]) {
  const systemMsg = messages[0];
  if (messages.length <= 5) return messages;
  return [systemMsg, ...messages.slice(-4)];
}

const SYSTEM_PROMPT = `You are MediMind AI, a professional and empathetic AI health assistant.

LANGUAGE RULES:
- If patient writes in Urdu or Roman Urdu, ALWAYS respond in Roman Urdu (e.g., "Aapko bukhaar hai, paani zyada piyein")
- If patient writes in English, respond in English
- Never mix scripts — use Roman Urdu OR English, not Urdu script

Your job:
- Listen carefully to symptoms
- Ask 1-2 smart follow-up questions
- Give clear, helpful health guidance
- Detect emergencies (chest pain, stroke, can't breathe, seizure, heart attack) and respond with "🚨 EMERGENCY ALERT:"
- Always say you are NOT a licensed doctor
- Be warm, caring and conversational like a real doctor

Keep responses concise and friendly.`;

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    if (!checkRateLimit()) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again!" },
        { status: 429 }
      );
    }

    const { messages, userId } = await req.json();

    if (!messages || !userId) {
      return NextResponse.json(
        { error: "Messages and userId required!" },
        { status: 400 }
      );
    }

    // Use gemini-1.5-flash-8b — best free tier model
    const model = genAI.getGenerativeModel({
     model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512, // Keep low to save tokens
      },
    });

    // Truncate to save tokens
    const truncated = truncateMessages(messages);

    // Build conversation as simple text
    const conversationText = truncated
      .map((msg: any) =>
        `${msg.role === "user" ? "Patient" : "MediMind AI"}: ${msg.content}`
      )
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversationText}\n\nMediMind AI:`;

    const result = await model.generateContent(fullPrompt);
    const aiResponse = result.response.text();

    // Emergency detection
    const emergencyKeywords = [
      "chest pain", "can't breathe", "cant breathe",
      "unconscious", "stroke", "seizure",
      "heart attack", "difficulty breathing", "severe bleeding"
    ];
    const lastMessage = messages[messages.length - 1];
    const isEmergency =
      emergencyKeywords.some(k =>
        lastMessage.content.toLowerCase().includes(k)
      ) || aiResponse.includes("EMERGENCY ALERT");

    return NextResponse.json({
      success: true,
      message: aiResponse,
      isEmergency,
    });

  } catch (error: any) {
    console.error("Chat error:", error?.status, error?.message);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "AI is busy right now. Please wait 30 seconds and try again!" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}