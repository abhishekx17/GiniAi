import { NextResponse } from "next/server";
import { db } from "../../../db";
import { randomUUID } from "crypto";
import { chat_sessions, messages } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
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

async function generateSessionName(prompt) {
  try {
    const chat = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Suggest a short chat session name for this prompt: "${prompt}". Only give one concise name under 10 letters.`,
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

    // Create session for this user
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

    // Get chat history (just this session)
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.session_id, session.id))
      .orderBy(messages.created_at);

    // Generate AI response
    const aiResponse = await generateGeminiResponse(prompt, history);

    // Save AI message
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

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (sessionId) {
      // Fetch messages for a specific session owned by the user
      const session = await db
        .select()
        .from(chat_sessions)
        .where(
          and(
            eq(chat_sessions.id, sessionId),
            eq(chat_sessions.clerkId, userId)
          )
        );

      if (session.length === 0) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.session_id, sessionId))
        .orderBy(messages.created_at);

      return NextResponse.json({ messages: msgs });
    }

    // Fetch all sessions belonging to the user
    const sessions = await db
      .select()
      .from(chat_sessions)
      .where(eq(chat_sessions.clerkId, userId))
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
