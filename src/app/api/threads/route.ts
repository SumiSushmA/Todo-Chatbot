// server-only
import { loadAll, saveAll } from '@/lib/tasks'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('thread')
  const all = await loadAll()
  const thread = (all.threads || []).find(t => t.id === id) || null
  return NextResponse.json(thread)
}

export async function POST(request: Request) {
  const data = await request.json()  // { thread: Thread }
  const all = await loadAll()
  const threads = all.threads || []

  // upsert
  const idx = threads.findIndex(t => t.id === data.thread.id)
  if (idx >= 0) threads[idx] = data.thread
  else threads.push(data.thread)
  await saveAll({ ...all, threads })

  return NextResponse.json({ success: true })
}

