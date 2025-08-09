'use client'

import { useEffect, useRef, useState } from 'react';
import ChatVoice from './ChatVoice';

type Msg = { sender: 'user' | 'bot'; text: string }

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const callBot = async (convo: Msg[]) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: convo }),
    })
    return res.json() as Promise<{ content?: string; error?: unknown }>
  }

  // unified send: used by text input + voice
  const sendMessage = async (text?: string) => {
    const contentToSend = (text ?? input).trim()
    if (!contentToSend || loading) return

    const userMsg: Msg = { sender: 'user', text: contentToSend }
    const convo = [...messages, userMsg]
    setMessages(convo)
    if (!text) setInput('')
    setLoading(true)

    try {
      const { content, error } = await callBot(convo)
      if (error) {
        setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ ' + JSON.stringify(error) }])
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: content || '' }])
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Network error' }])
    } finally {
      setLoading(false)
    }
  }

  // last bot reply for TTS
  const lastBotReply = [...messages].reverse().find(m => m.sender === 'bot')?.text

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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

      {/* Voice controls */}
      <div className="border-t px-4 pt-3">
        <ChatVoice onSendMessage={(t) => sendMessage(t)} lastBotReply={lastBotReply} />
      </div>

      {/* Text input */}
      <div className="p-4 flex items-center space-x-2">
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
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
