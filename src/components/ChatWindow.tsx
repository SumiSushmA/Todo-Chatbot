'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import ChatVoice from './ChatVoice';

export type Msg = { sender: 'user' | 'bot'; text: string }
export type Thread = { id: string; title: string; messages?: Msg[] }

type Props = {
  thread: Thread
  onUpdate: (msgs: Msg[]) => void
}

export default function ChatWindow({ thread, onUpdate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakNext, setSpeakNext] = useState(false) // voice-only replies
  const endRef = useRef<HTMLDivElement>(null)

  const safeMsgs: Msg[] = useMemo(
    () => (Array.isArray(thread.messages) ? thread.messages : []),
    [thread.messages]
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [safeMsgs.length])

  // IMPORTANT: when thread id changes (new chat), ensure TTS is off
  useEffect(() => {
    setSpeakNext(false)
  }, [thread.id])

  // ---------- PERSIST HELPERS ----------
  const saveToLocalThreads = (msgs: Msg[]) => {
    const key = 'chat_threads'
    const raw = localStorage.getItem(key)
    let arr: Thread[] = []
    if (raw) {
      try { arr = JSON.parse(raw) } catch {}
    }
    const idx = arr.findIndex(t => t.id === thread.id)
    const updated: Thread = { id: thread.id, title: thread.title, messages: msgs }
    if (idx >= 0) arr[idx] = updated
    else arr.push(updated)
    localStorage.setItem(key, JSON.stringify(arr))
    localStorage.setItem('active_thread', thread.id)
  }

  const saveToDb = async (msgs: Msg[]) => {
    const now = new Date().toISOString()
    const dbMsgs = msgs.map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
      ts: now,
    }))
    await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thread: thread.id,
        updated: now,
        messages: dbMsgs,
      }),
    })
  }

  const persistAll = async (msgs: Msg[]) => {
    saveToLocalThreads(msgs)
    try { await saveToDb(msgs) } catch {}
  }
  // -------------------------------------

  const callBot = async (convo: Msg[]) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: convo }),
    })
    return res.json() as Promise<{ content?: string; error?: unknown }>
  }

  const maybeGreet = (text: string): string | null => {
    const t = text.toLowerCase().trim()
    if (/^(hi+|hello|hey)\b/.test(t)) {
      const variants = [
        'hii, how can I help you?',
        'hello! how can I assist?',
        'hey there — what do you need?',
      ]
      return variants[Math.floor(Math.random() * variants.length)]
    }
    return null
  }

  const sendCore = async (contentToSend: string) => {
    const userMsg: Msg = { sender: 'user', text: contentToSend }
    const base = [...safeMsgs, userMsg]
    onUpdate(base)
    await persistAll(base)

    const greet = maybeGreet(contentToSend)
    if (greet) {
      const botMsg: Msg = { sender: 'bot', text: greet }
      const next = [...base, botMsg]
      onUpdate(next)
      await persistAll(next)
      return
    }

    setLoading(true)
    try {
      const { content, error } = await callBot(base)
      const botMsg: Msg = error
        ? { sender: 'bot', text: '⚠️ ' + JSON.stringify(error) }
        : { sender: 'bot', text: content || '' }
      const next = [...base, botMsg]
      onUpdate(next)
      await persistAll(next)
    } catch {
      const botMsg: Msg = { sender: 'bot', text: '⚠️ Network error' }
      const next = [...base, botMsg]
      onUpdate(next)
      await persistAll(next)
    } finally {
      setLoading(false)
    }
  }

  const sendTyped = async () => {
    const contentToSend = input.trim()
    if (!contentToSend || loading) return
    setSpeakNext(false) // typed → silent
    setInput('')
    await sendCore(contentToSend)
  }

  const sendFromVoice = async (text: string) => {
    const contentToSend = text.trim()
    if (!contentToSend || loading) return
    setSpeakNext(true) // voice → speak next bot reply
    await sendCore(contentToSend)
  }

  // last bot message + a strong unique TTS key
  let lastBotText: string | undefined
  let lastBotIndex = -1
  for (let i = safeMsgs.length - 1; i >= 0; i--) {
    if (safeMsgs[i].sender === 'bot') {
      lastBotText = safeMsgs[i].text
      lastBotIndex = i
      break
    }
  }
  const ttsKey = `${thread.id}:${lastBotIndex}` // unique per thread & message index

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow">
      <div className="px-6 py-4 border-b text-lg font-semibold">Chatbot</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {safeMsgs.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-lg break-words ${
                m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t px-4 pt-3">
        <ChatVoice
          onSendMessage={sendFromVoice}
          lastBotReply={lastBotText}
          lastKey={ttsKey}
          speak={speakNext}
          onSpoken={() => setSpeakNext(false)}
        />
      </div>

      <div className="p-4 flex items-center gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendTyped()}
          disabled={loading}
          placeholder="Type your message…"
        />
        <button
          onClick={sendTyped}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
