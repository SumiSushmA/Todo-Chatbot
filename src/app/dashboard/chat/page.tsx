'use client'

import ChatWindow, { Msg, Thread } from '@/components/ChatWindow'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const threadId = searchParams.get('thread') || ''

  const [thread, setThread] = useState<Thread>({
    id: '',
    title: '',
    messages: [],
  })

  // Load or initialize the thread on mount / when threadId changes
  useEffect(() => {
    const raw = localStorage.getItem('chat_threads')
    let threads: Thread[] = []

    if (raw) {
      try {
        threads = JSON.parse(raw)
      } catch {
        threads = []
      }
    }

    if (threadId) {
      // Existing thread: load it
      const existing = threads.find((t) => t.id === threadId)
      if (existing) {
        setThread(existing)
      } else {
        // Invalid ID: drop it
        router.replace('/dashboard/chat')
      }
    } else {
      // No threadId: start fresh
      setThread({ id: '', title: '', messages: [] })
    }
  }, [threadId, router])

  // Persist a thread back into localStorage
  const saveThread = (t: Thread) => {
    const raw = localStorage.getItem('chat_threads')
    let threads: Thread[] = raw ? JSON.parse(raw) : []

    const idx = threads.findIndex((x) => x.id === t.id)
    if (idx >= 0) threads[idx] = t
    else threads.push(t)

    localStorage.setItem('chat_threads', JSON.stringify(threads))
  }

  // Called by ChatWindow whenever messages update
  const handleUpdate = (msgs: Msg[]) => {
    let t = { ...thread, messages: msgs }

    // On first message, assign an ID + title + update URL
    if (!t.id && msgs.length) {
      const id = uuidv4()
      t.id = id
      t.title = msgs[0].text.slice(0, 20) // first message snippet
      router.replace(`/dashboard/chat?thread=${id}`)
    }

    setThread(t)
    saveThread(t)
  }

  return (
    <div className="p-6 h-full">
      <ChatWindow thread={thread} onUpdate={handleUpdate} />
    </div>
  )
}
