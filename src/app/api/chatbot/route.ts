import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemPrompt = `You are Baaraath Bot, the helpful assistant for Baaraath, an event venue and services booking platform in India. Help people find event services, understand how to browse and book, and answer general questions about using Baaraath. Keep replies friendly, clear, and concise, and always use fewer than 100 words. Do not invent specific prices, vendor availability, booking status, policies, phone numbers, or addresses. If a question needs account-specific help or information you do not have, direct the user to support@baaraath.com or their My Bookings page. Do not claim to have made or changed a booking.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "Baaraath Bot is not configured yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("messages" in body)) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const { messages } = body as { messages: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    return NextResponse.json({ error: "Invalid chat history." }, { status: 400 });
  }

  const safeMessages: ChatMessage[] = [];
  for (const message of messages) {
    if (
      !message ||
      typeof message !== "object" ||
      !("role" in message) ||
      !("content" in message) ||
      !["user", "assistant"].includes(String(message.role)) ||
      typeof message.content !== "string"
    ) {
      return NextResponse.json({ error: "Invalid chat message." }, { status: 400 });
    }

    const content = message.content.trim();
    if (content.length > 1500) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }
    if (content) {
      safeMessages.push({ role: message.role as ChatMessage["role"], content });
    }
  }

  if (safeMessages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Add a message to continue." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
        max_completion_tokens: 400,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Baaraath Bot could not reply right now. Please try again." },
        { status: response.status === 429 ? 503 : 502 },
      );
    }

    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== "object" ||
      !("choices" in result) ||
      !Array.isArray(result.choices)
    ) {
      return NextResponse.json({ error: "Baaraath Bot could not reply right now." }, { status: 502 });
    }

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Baaraath Bot could not reply right now." }, { status: 502 });
    }

    const reply = content.trim().split(/\s+/u).slice(0, 99).join(" ");
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Baaraath Bot could not connect right now. Please try again." },
      { status: 502 },
    );
  }
}
