// // File: src/app/dashboard/chat/page.tsx
// 'use client'

// import Chatbot from '../../../components/Chatbot'

// export default function ChatPage() {
//   return (
//     <div className="bg-white p-6 rounded-xl shadow-md">
//       <h2 className="text-2xl font-semibold mb-4">Chatbot</h2>
//       <Chatbot />
//     </div>
//   )
// }

// 'use client'

// import Chatbot from '../../../components/Chatbot'

// export default function ChatPage() {
//   return (
//     <div className="flex flex-col h-full">
//       <h2 className="text-2xl font-semibold mb-4">Chatbot</h2>
//       <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
//         <Chatbot />
//       </div>
//     </div>
//   )
// }



// 'use client'

// import ChatSidebar, { Thread } from '@/components/ChatSidebar'
// import ChatWindow, { Msg } from '@/components/ChatWindow'
// import { useEffect, useState } from 'react'
// import { v4 as uuidv4 } from 'uuid'

// export default function ChatPage() {
//   const [threads, setThreads] = useState<Thread[]>([])
//   const [activeId, setActiveId] = useState<string | null>(null)

//   // Load threads from localStorage on mount
//   useEffect(() => {
//     const stored = localStorage.getItem('chat_threads')
//     if (stored) {
//       const parsed: Thread[] = JSON.parse(stored)
//       setThreads(parsed)
//       if (parsed.length) setActiveId(parsed[0].id)
//     }
//   }, [])

//   // Persist threads whenever they change
//   useEffect(() => {
//     localStorage.setItem('chat_threads', JSON.stringify(threads))
//   }, [threads])

//   // Add a new thread
//   const newThread = () => {
//     const id = uuidv4()
//     const thread: Thread = { id, title: 'New Chat', messages: [] }
//     setThreads(prev => [thread, ...prev])
//     setActiveId(id)
//   }

//   const activeThread = threads.find(t => t.id === activeId) || null

//   // Update a thread's messages
//   const updateThread = (id: string, messages: Msg[]) => {
//     setThreads(prev =>
//       prev.map(t => (t.id === id ? { ...t, messages, title: messages[0]?.text.slice(0,20) || 'Chat' } : t))
//     )
//   }

//   return (
//     <div className="flex h-full">
//       <ChatSidebar
//         threads={threads}
//         activeId={activeId}
//         onSelect={setActiveId}
//         onNew={newThread}
//       />
//       <div className="flex-1 p-6">
//         {activeThread && (
//           <ChatWindow
//             thread={activeThread}
//             onUpdate={(msgs) => updateThread(activeThread.id, msgs)}
//           />
//         )}
//       </div>
//     </div>
//   )
// }

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
