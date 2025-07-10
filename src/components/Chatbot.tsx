// // src\components\Chatbot.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";

// type Msg = { sender: "user" | "bot"; text: string };

// export default function Chatbot() {
//   const [messages, setMessages] = useState<Msg[]>([]);
//   const [input, setInput] = useState("");
//   const endRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   async function sendMessage() {
//     if (!input.trim()) return;
//     const userMsg: Msg = { sender: "user", text: input };
//     const convo: Msg[] = [...messages, userMsg];
//     setMessages(convo);
//     setInput("");

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ messages: convo }),
//       });
//       const { content } = await res.json();
//       setMessages((prev) => [...prev, { sender: "bot", text: content }]);
//     } catch {
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "⚠️ Something went wrong." },
//       ]);
//     }
//   }

//   return (
//     <div style={{
//       position: "fixed", bottom: 20, right: 20,
//       width: 300, height: 360, display: "flex", flexDirection: "column",
//       border: "1px solid #ccc", borderRadius: 8, background: "#fff",
//       boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
//     }}>
//       <div style={{
//         flex: 1, padding: 12, overflowY: "auto", fontSize: 14, lineHeight: 1.4
//       }}>
//         {messages.map((m, i) => (
//           <div key={i} style={{
//             textAlign: m.sender === "bot" ? "left" : "right",
//             margin: "6px 0"
//           }}>
//             <span style={{
//               display: "inline-block", padding: "6px 10px",
//               borderRadius: 16,
//               background: m.sender === "bot" ? "#eee" : "#007bff",
//               color: m.sender === "bot" ? "#000" : "#fff",
//             }}>
//               {m.text}
//             </span>
//           </div>
//         ))}
//         <div ref={endRef} />
//       </div>
//       <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
//         <input
//           style={{ flex: 1, border: "none", padding: "10px", outline: "none" }}
//           placeholder="Ask me…"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           style={{ border: "none", padding: "0 16px", cursor: "pointer" }}
//           onClick={sendMessage}
//         >➤</button>
//       </div>
//     </div>
//   );
// }

'use client'

import { useEffect, useRef, useState } from 'react';

type Msg = { sender: 'user' | 'bot'; text: string }

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: Msg = { sender: 'user', text: input.trim() }
    const convo = [...messages, userMsg]
    setMessages(convo)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convo }),
      })
      const { content, error } = await res.json()
      if (error) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: '⚠️ ' + JSON.stringify(error) },
        ])
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: content }])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: '⚠️ Network error' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[70%] px-3 py-2 rounded-lg break-words
                ${m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}
              `}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message…"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
