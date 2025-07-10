import { promises as fs } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

const CRED_PATH = path.join(process.cwd(), 'data', 'credentials.json')
const OTP_PATH  = path.join(process.cwd(), 'data', 'otp.json')

export async function POST(req: Request) {
  const { email, code, newPassword } = await req.json()
  let otpData
  try {
    otpData = JSON.parse(await fs.readFile(OTP_PATH, 'utf-8'))
  } catch {
    return NextResponse.json({ error: 'No OTP request' }, { status: 400 })
  }

  if (
    otpData.email !== email ||
    otpData.code !== code ||
    Date.now() > otpData.expires
  ) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
  }

  // update credentials
  const creds = JSON.parse(await fs.readFile(CRED_PATH, 'utf-8'))
  creds.password = newPassword
  await fs.writeFile(CRED_PATH, JSON.stringify(creds, null, 2))
  await fs.unlink(OTP_PATH)

  return NextResponse.json({ ok: true })
}
