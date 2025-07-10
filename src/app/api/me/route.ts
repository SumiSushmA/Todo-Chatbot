// src/app/api/me/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match  = cookie.match(/user=([^;]+)/)
  const user   = match ? match[1] : null
  return NextResponse.json({ user })
}
