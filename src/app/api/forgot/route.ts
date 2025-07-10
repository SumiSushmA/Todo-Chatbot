import { randomInt } from 'crypto'
import { promises as fs } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const CRED_PATH = path.join(process.cwd(), 'data', 'credentials.json')
const OTP_PATH  = path.join(process.cwd(), 'data', 'otp.json')

export async function POST(req: Request) {
  const { email } = await req.json()
  const creds = JSON.parse(await fs.readFile(CRED_PATH, 'utf-8'))

  if (email !== creds.email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  const code = String(randomInt(100000, 999999))
  const expires = Date.now() + 10 * 60 * 1000  // 10 min
  await fs.writeFile(OTP_PATH, JSON.stringify({ email, code, expires }, null, 2))

  console.log(`🔑 OTP for ${email}:`, code)
  // In a real app you’d send email here.
  return NextResponse.json({ ok: true })
}
