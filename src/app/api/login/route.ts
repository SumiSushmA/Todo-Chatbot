import { promises as fs } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const CRED_PATH = path.join(process.cwd(), 'data', 'credentials.json')

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const creds = JSON.parse(await fs.readFile(CRED_PATH, 'utf-8'))
  if (email === creds.email && password === creds.password) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('user', email, { path: '/', httpOnly: true })
    return res
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
