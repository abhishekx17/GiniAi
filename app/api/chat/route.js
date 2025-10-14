import { NextResponse } from "next/server";
import { db } from "../../../db";
import { randomUUID } from "crypto";
import { chat_sessions, messages } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function generateGeminiResponse(prompt, history) {
  const chatHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    parts: [{ text: msg.content }],
  }));

  const contents = [
    ...chatHistory,
    { role: "user", parts: [{ text: prompt }] },
  ];

  const chat = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents,
  });

  return chat.text || "No response generated.";
}

// ---- Generate a session name ----
async function generateSessionName(prompt) {
  try {
    const chat = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Suggest a short chat session name for this prompt: "${prompt}" only give response of the session name in 10 letters only give one name  `,
            },
          ],
        },
      ],
    });
    return (
      chat.text?.substring(0, 100) || `Chat ${new Date().toLocaleString()}`
    );
  } catch {
    return `Chat ${new Date().toLocaleString()}`;
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { prompt } = body;

    if (!prompt)
      return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const sessionName = await generateSessionName(prompt);

    const [session] = await db
      .insert(chat_sessions)
      .values({
        id: randomUUID(),
        clerkId: userId,
        session_name: sessionName,
      })
      .returning();

    // Save user message
    await db.insert(messages).values({
      session_id: session.id,
      role: "user",
      content: prompt,
    });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.session_id, session.id))
      .orderBy(messages.created_at);

    const aiResponse = await generateGeminiResponse(prompt, history);

    await db.insert(messages).values({
      session_id: session.id,
      role: "assistant",
      content: aiResponse,
    });

    return NextResponse.json({
      message: aiResponse,
      sessionId: session.id,
      sessionName,
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const sessions = await db
      .select()
      .from(chat_sessions)
      .orderBy(chat_sessions.updated_at);

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("GET /api/chat error:", err);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
