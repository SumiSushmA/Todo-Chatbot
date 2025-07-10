// // =================================================================
// // File: src/app/dashboard/layout.tsx
// // =================================================================
// import Link from 'next/link'
// import React from 'react'

// export const metadata = { title: 'Dashboard' }

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar navigation */}
//       <nav className="w-1/4 border-r bg-gray-50 p-6 space-y-4">
//         <Link href="/dashboard/chat" className="block text-lg font-medium text-gray-700 hover:text-blue-600">Chat</Link>
//         <Link href="/dashboard/tasks" className="block text-lg font-medium text-gray-700 hover:text-blue-600">Tasks</Link>
//         <Link href="/dashboard/history" className="block text-lg font-medium text-gray-700 hover:text-blue-600">History</Link>
//         <Link href="/dashboard/profile" className="block text-lg font-medium text-gray-700 hover:text-blue-600">Profile</Link>
//         <Link href="/api/logout" className="block text-lg font-medium text-red-600 hover:text-red-800 mt-6">Logout</Link>
//       </nav>

//       {/* Main content area */}
//       <main className="flex-1 overflow-auto p-6 bg-white">
//         {children}
//       </main>
//     </div>
//   )
// }

// File: src/app/dashboard/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: 'Chat',    href: '/dashboard/chat'    },
    { label: 'Tasks',   href: '/dashboard/tasks'   },
    { label: 'History', href: '/dashboard/history' },
    { label: 'Profile', href: '/dashboard/profile' },
  ]

  const handleLogout = async () => {
    if (!confirm('Do you really want to log out?')) {
      return
    }

    try {
      // Call your logout endpoint to clear session/cookies
      await fetch('/api/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout request failed', err)
    }

    // Finally, send the user to the login page
    router.push('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-50 via-white to-gray-50 p-6 space-y-4 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600">Todolist Chatbot</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ label, href }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={
                  `block px-4 py-2 rounded-lg font-medium transition ` +
                  (isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-blue-100')
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-white p-6">
        {children}
      </main>
    </div>
  )
}
