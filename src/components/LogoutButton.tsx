// src/components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      Logout
    </button>
  )
}
