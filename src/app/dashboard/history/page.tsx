// // File: src/app/dashboard/history/page.tsx
// 'use client'

// import Link from 'next/link';
// import { useEffect, useState } from 'react';

// export type Msg = { sender: 'user' | 'bot'; text: string }
// export type Thread = { id: string; title: string; messages: Msg[] }

// export default function HistoryPage() {
//   const [threads, setThreads] = useState<Thread[]>([])

//   useEffect(() => {
//     const raw = localStorage.getItem('chat_threads')
//     if (raw) {
//       try {
//         setThreads(JSON.parse(raw))
//       } catch {
//         console.error('Failed to parse chat_threads from localStorage')
//         setThreads([])
//       }
//     }
//   }, [])

//   return (
//     <div className="h-full">
//       <h1 className="text-2xl font-semibold mb-6">Chat History</h1>

//       {threads.length === 0 ? (
//         <p className="text-gray-500">No conversations yet.</p>
//       ) : (
//         <div className="space-y-8 overflow-auto max-h-[80vh]">
//           {threads.map((thread) => (
//             <div key={thread.id} className="bg-gray-50 p-6 rounded-lg shadow">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-medium">{thread.title}</h2>
//                 <Link
//                   href="/dashboard/chat"
//                   className="text-blue-600 hover:underline"
//                 >
//                   Open
//                 </Link>
//               </div>

//               <div className="space-y-2">
//                 {thread.messages.map((m, i) => (
//                   <div
//                     key={i}
//                     className={`flex ${
//                       m.sender === 'user' ? 'justify-end' : 'justify-start'
//                     }`}
//                   >
//                     <span
//                       className={`inline-block px-3 py-2 rounded-lg max-w-[70%] break-words ${
//                         m.sender === 'user'
//                           ? 'bg-blue-100 text-blue-900'
//                           : 'bg-white text-gray-800'
//                       }`}
//                     >
//                       {m.text}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


// File: src/app/dashboard/history/page.tsx
'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type Msg = { sender: 'user' | 'bot'; text: string }
export type Thread = { id: string; title: string; messages: Msg[] }

export default function HistoryPage() {
  const [threads, setThreads] = useState<Thread[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('chat_threads')
    if (raw) {
      try {
        setThreads(JSON.parse(raw))
      } catch {
        console.error('Failed to parse chat_threads from localStorage')
        setThreads([])
      }
    }
  }, [])

  const deleteThread = (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return
    const updated = threads.filter((t) => t.id !== id)
    setThreads(updated)
    localStorage.setItem('chat_threads', JSON.stringify(updated))
  }

  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-semibold mb-6">Chat History</h1>

      {threads.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-6 overflow-auto max-h-[80vh]">
          {threads.map((thread) => {
            const userMsgs = thread.messages.filter(m => m.sender === 'user')
            const botMsgs = thread.messages.filter(m => m.sender === 'bot')
            const lastUser = userMsgs.at(-1)?.text ?? ''
            const lastBot = botMsgs.at(-1)?.text ?? ''

            return (
              <div key={thread.id} className="bg-gray-50 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium truncate">{thread.title}</h2>
                  <div className="space-x-4">
                    <Link
                      href="/dashboard/chat"
                      onClick={() => localStorage.setItem('active_thread', thread.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => deleteThread(thread.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    <strong>You:</strong> {lastUser}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Bot:</strong> {lastBot}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}