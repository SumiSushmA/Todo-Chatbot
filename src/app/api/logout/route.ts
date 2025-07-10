// src/app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('user', '', { maxAge: 0, path: '/' })
  return res
}
