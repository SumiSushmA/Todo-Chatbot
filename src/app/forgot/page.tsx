'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ForgotPage() {
  const [step, setStep] = useState<1|2>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const sendOtp = async () => {
    setMsg('')
    const res = await fetch('/api/forgot', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      setMsg('OTP sent! Check your email.')
      setStep(2)
    } else {
      const err = await res.json()
      setMsg(err.error)
    }
  }

  const resetPwd = async () => {
    setMsg('')
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, code, newPassword: newPwd }),
    })
    if (res.ok) {
      setMsg('Password updated. Redirecting to login…')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      const err = await res.json()
      setMsg(err.error)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            {msg && <p className="mb-4 text-red-500">{msg}</p>}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={sendOtp}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            {msg && <p className="mb-4 text-red-500">{msg}</p>}
            <input
              type="text"
              placeholder="Enter OTP"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={resetPwd}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Update Password
            </button>
          </>
        )}
      </div>
    </div>
  )
}
