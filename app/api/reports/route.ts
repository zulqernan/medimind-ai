import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const language = formData.get("language") as string || "en";

    if (!file) {
      return NextResponse.json(
        { error: "File required!" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const languageInstruction = language === "ur"
      ? "\n\nIMPORTANT: Respond in Roman Urdu (e.g., 'Aapki report mein malaria ke alamat hain'). Easy simple language use karo jo aam banda samajh sake."
      : "\n\nRespond in clear simple English.";

    const prompt = `You are an expert medical lab report analyzer. Analyze this lab report and respond in this EXACT format:

SEVERITY: [NORMAL or MODERATE or URGENT]
CONFIDENCE: [number between 70-98]%

SUMMARY:
[2-3 sentence overview]

RECOMMENDED ACTION:
[What patient should do immediately]

KEY FINDINGS:
[List each test with value and status - NORMAL/HIGH/LOW]

ABNORMAL VALUES:
[Only abnormal results with explanation in simple language]

DEFICIENCIES DETECTED:
[Any deficiencies found, or "None detected"]

PATIENT FRIENDLY EXPLANATION:
[Explain findings in very simple language a non-medical person can understand]

HEALTH RISKS:
[Potential risks based on results]

DOCTOR CONSULTATION:
[When and why to see a doctor]

DISCLAIMER: This is AI analysis only, not a medical diagnosis.` + languageInstruction;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
      prompt,
    ]);

    const analysis = result.response.text();

    return NextResponse.json({
      success: true,
      analysis,
      fileName: file.name,
      fileType: mimeType,
    });

  } catch (error: any) {
    console.error("Report analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed! Please try again." },
      { status: 500 }
    );
  }
}