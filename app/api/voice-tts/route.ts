import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text required!" },
        { status: 400 }
      );
    }

    // Use Rachel voice — natural female English voice
    const audioStream = await client.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Voice generation failed!" },
      { status: 500 }
    );
  }
}