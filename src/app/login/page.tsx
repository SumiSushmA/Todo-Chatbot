'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) router.push('/dashboard')
    else setError('Invalid email or password')
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="flex w-11/12 max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Left: Form */}
        <div className="w-1/2 p-8">
          <h1 className="text-3xl font-bold mb-6">Todolist With Chatbot</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Toggle password visibility"
              >
                👁️
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-sm">
            <a href="/forgot" className="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Right: Background */}
        <div className="w-1/2 relative">
          <Image src="/todobg.jpg" alt="BG" fill className="object-cover" />
          <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-2xl font-semibold text-center">
              Start your journey by one click, explore beautiful world!
            </h2>
            <div className="mt-6 flex space-x-2">
              <span className="h-2 w-2 bg-white rounded-full"></span>
              <span className="h-2 w-2 bg-white opacity-50 rounded-full"></span>
              <span className="h-2 w-2 bg-white opacity-25 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
