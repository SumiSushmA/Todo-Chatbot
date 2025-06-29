// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1) Parse the incoming messages
  const { messages }: { messages: { sender: string; text: string }[] } =
    await req.json();

  // 2) Grab the very last user message
  const lastUser = messages
    .filter((m) => m.sender === "user")
    .pop()?.text ?? "";

  // 3) Call Gemini’s generateContent endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const apiRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: lastUser }],
        },
      ],
    }),
  });

  // 4) Handle any API errors
  if (!apiRes.ok) {
    const err = await apiRes.text();
    console.error("Gemini error:", err);
    return NextResponse.json({ content: "❌ API error" }, { status: 500 });
  }

  // 5) Parse and flatten the response
  const json = await apiRes.json();
  const candidate = json.candidates?.[0]?.content;
  let replyText = "";

  if (candidate && Array.isArray(candidate.parts)) {
    // each part is an object with a .text property
    replyText = candidate.parts.map((p: any) => p.text).join("");
  } else if (typeof candidate === "string") {
    replyText = candidate;
  } else if (candidate?.text) {
    replyText = candidate.text;
  }

  // 6) Return a plain string
  return NextResponse.json({ content: replyText });
}
