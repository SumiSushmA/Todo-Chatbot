// src/app/dashboard/layout.tsx
'use client'

import { LogoutButton } from '@/components/LogoutButton'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems: { label: string; href: string }[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Chat',      href: '/dashboard/chat' },
    { label: 'Tasks',     href: '/dashboard/tasks' },
    { label: 'History',   href: '/dashboard/history' },
    { label: 'Profile',   href: '/dashboard/profile' },
  ]

  const linkBase = 'block px-3 py-2 rounded transition-colors duration-150'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (white) */}
      <nav className="w-60 bg-white border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Todolist Chatbot
        </h2>
        <ul className="space-y-2">
          {navItems.map(({ label, href }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    linkBase +
                    (isActive
                      ? ' bg-blue-100 text-blue-600'
                      : ' text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                  }
                >
                  {label}
                </Link>
              </li>
            )
          })}

          <li>
            <LogoutButton className={linkBase + ' text-red-600 hover:bg-red-50'} />
          </li>
        </ul>
      </nav>

      {/* Main content area (also white, with dark text) */}
      <main className="flex-1 bg-white text-gray-800 p-6">
        {children}
      </main>
    </div>
  )
}
