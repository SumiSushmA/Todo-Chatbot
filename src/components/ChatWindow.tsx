// src/components/ChatWindow.tsx
'use client'

import { useEffect, useRef, useState } from 'react';

export type Msg = { sender: 'user' | 'bot'; text: string }
export type Thread = { id: string; title: string; messages: Msg[] }

type Props = {
  thread: Thread
  onUpdate: (msgs: Msg[]) => void
}

export default function ChatWindow({ thread, onUpdate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // scroll on message change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: Msg = { sender: 'user', text: input.trim() }
    const newMsgs = [...thread.messages, userMsg]
    onUpdate(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ messages: newMsgs })
      })
      const { content, error } = await res.json()
      const replyTxt = error ? `⚠️ ${JSON.stringify(error)}` : content
      const botMsg: Msg = { sender: 'bot', text: replyTxt }
      onUpdate([...newMsgs, botMsg])
    } catch {
      const errMsg: Msg = { sender: 'bot', text: '⚠️ Network error' }
      onUpdate([...newMsgs, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Chatbot</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {thread.messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[60%] break-words ${
                m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-500">...</p>}
        <div ref={endRef} />
      </div>
      <div className="flex items-center p-4 border-t">
        <input
          className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none"
          placeholder="Type your message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >Send</button>
      </div>
    </div>
  )
}
