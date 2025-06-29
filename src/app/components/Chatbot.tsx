// src/components/Chatbot.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { sender: "user" | "bot"; text: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg: Msg = { sender: "user", text: input };
    const convo: Msg[] = [...messages, userMsg];
    setMessages(convo);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: convo }),
      });
      const { content } = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong." },
      ]);
    }
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      width: 300, height: 360, display: "flex", flexDirection: "column",
      border: "1px solid #ccc", borderRadius: 8, background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        flex: 1, padding: 12, overflowY: "auto", fontSize: 14, lineHeight: 1.4
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            textAlign: m.sender === "bot" ? "left" : "right",
            margin: "6px 0"
          }}>
            <span style={{
              display: "inline-block", padding: "6px 10px",
              borderRadius: 16,
              background: m.sender === "bot" ? "#eee" : "#007bff",
              color: m.sender === "bot" ? "#000" : "#fff",
            }}>
              {m.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
        <input
          style={{ flex: 1, border: "none", padding: "10px", outline: "none" }}
          placeholder="Ask me…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          style={{ border: "none", padding: "0 16px", cursor: "pointer" }}
          onClick={sendMessage}
        >➤</button>
      </div>
    </div>
  );
}
