// src/app/dashboard/chat/page.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ChatWindow, { Msg, Thread } from '@/components/ChatWindow'

export default function ChatPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const threadId     = searchParams.get('thread') || ''

  const [thread, setThread] = useState<Thread>({
    id: '',
    title: '',
    messages: [],
  })

  useEffect(() => {
    if (!threadId) return
    fetch(`/api/threads?thread=${threadId}`)
      .then((r) => r.json())
      .then((t) => t && setThread(t))
      .catch(console.error)
  }, [threadId])

  async function handleUpdate(msgs: Msg[]) {
    let t = { ...thread, messages: msgs }

    if (!t.id) {
      t.id    = uuidv4()
      t.title = msgs[0]?.text.slice(0, 20) || 'New Chat'
      router.replace(`/dashboard/chat?thread=${t.id}`)
    }

    setThread(t)
    await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread: t }),
    })
  }

  return (
    <div className="p-6 h-full bg-white">
      <ChatWindow thread={thread} onUpdate={handleUpdate} />
    </div>
  )
}
