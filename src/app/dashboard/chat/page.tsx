'use client'

import ChatWindow, { Msg, Thread } from '@/components/ChatWindow'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

export default function ChatPage() {
  const [thread, setThread] = useState<Thread>(() => ({
    id: uuid(),
    title: 'New Conversation',
    messages: [],
  }))

  // Load the previously active thread (if any)
  useEffect(() => {
    const activeId = localStorage.getItem('active_thread')
    const raw = localStorage.getItem('chat_threads')
    if (!raw) return
    try {
      const arr = JSON.parse(raw) as Thread[]
      const match = arr.find(t => t.id === (activeId || ''))
      if (match) setThread(match)
    } catch {}
  }, [])

  const handleUpdate = (msgs: Msg[]) => {
    setThread(t => ({ ...t, messages: msgs }))
  }

  const newChat = () => {
    const fresh: Thread = { id: uuid(), title: 'New Conversation', messages: [] }
    setThread(fresh)
    // write an empty thread to localStorage and make it active
    const key = 'chat_threads'
    let arr: Thread[] = []
    const raw = localStorage.getItem(key)
    if (raw) {
      try { arr = JSON.parse(raw) } catch {}
    }
    arr.push(fresh)
    localStorage.setItem(key, JSON.stringify(arr))
    localStorage.setItem('active_thread', fresh.id)
  }

  return (
    <div className="p-6 h-full bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat</h2>
        <button
          onClick={newChat}
          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          title="Start a brand new conversation"
        >
          + New Chat
        </button>
      </div>

      <ChatWindow thread={thread} onUpdate={handleUpdate} />
    </div>
  )
}
