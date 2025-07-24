// src/app/api/threads/route.ts
import ThreadModel from '@/lib/models/Thread'
import connectToDatabase from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  await connectToDatabase()
  const threads = await ThreadModel.find().sort({ updated: -1 })
  return NextResponse.json(threads)
}

export async function POST(request: Request) {
  await connectToDatabase()
  const body = await request.json()
  const created = await ThreadModel.create(body)
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(request: Request) {
  await connectToDatabase()
  const { thread } = await request.json()
  await ThreadModel.deleteOne({ thread })
  return NextResponse.json({ ok: true })
}
