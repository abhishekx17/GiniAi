import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "../../../../db";
import { chat_sessions, messages } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from "crypto";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function generateGeminiResponse(prompt, history) {
  const chatHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    parts: [{ text: msg.content }],
  }));

  const chat = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [...chatHistory, { role: "user", parts: [{ text: prompt }] }],
  });

  return chat.text || "No response generated";
}

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { prompt, sessionId } = await req.json();
    if (!prompt || prompt.trim() === "")
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );

    let session;
    if (sessionId) {
      [session] = await db
        .select()
        .from(chat_sessions)
        .where(eq(chat_sessions.id, sessionId))
        .limit(1);

      // Ensure session belongs to the user
      if (session?.clerkId !== userId) session = null;
    }

    if (!session) {
      [session] = await db
        .insert(chat_sessions)
        .values({
          id: randomUUID(),
          session_name: `Chat ${new Date().toLocaleString()}`,
          clerkId: userId,
        })
        .returning();
    }

    const historyDB = await db
      .select()
      .from(messages)
      .where(eq(messages.session_id, session.id))
      .orderBy(messages.created_at);
    console.log("historyDB", historyDB);

    const history = historyDB.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    await db
      .insert(messages)
      .values({ session_id: session.id, role: "user", content: prompt });

    const aiResponse = await generateGeminiResponse(prompt, history);

    await db.insert(messages).values({
      session_id: session.id,
      role: "model",
      content: aiResponse,
    });

    return NextResponse.json({ message: aiResponse, sessionId: session.id });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

export async function GET(req, context) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { params } = context;
  const { id } = params;
  if (!id)
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );

  const session = await db
    .select()
    .from(chat_sessions)
    .where(eq(chat_sessions.id, id), eq(chat_sessions.clerkId, userId))
    .limit(1)
    .then((res) => res[0]);

  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.session_id, id))
    .orderBy(messages.created_at);

  return NextResponse.json({ session, messages: msgs });
}

export async function PATCH(req, context) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { params } = context;
    const { id } = params;
    const { newName } = await req.json();
    if (!newName || newName.trim() === "")
      return NextResponse.json(
        { error: "New name is required" },
        { status: 400 }
      );

    const updated = await db
      .update(chat_sessions)
      .set({ session_name: newName })
      .where(eq(chat_sessions.id, id), eq(chat_sessions.clerkId, userId))
      .returning();

    if (!updated.length)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({
      message: "Session renamed",
      session: updated[0],
    });
  } catch (error) {
    console.error("Rename failed:", error);
    return NextResponse.json({ error: "Rename failed" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  const { userId } = getAuth(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { params } = context;
    const { id } = params;

    // Ensure messages belong to this session
    await db.delete(messages).where(eq(messages.session_id, id));

    const deleted = await db
      .delete(chat_sessions)
      .where(eq(chat_sessions.id, id), eq(chat_sessions.clerkId, userId))
      .returning();

    if (!deleted.length)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ message: "Session deleted", sessionId: id });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
