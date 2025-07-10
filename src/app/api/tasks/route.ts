// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loadAll, saveAll } from '../../../lib/tasks'

export async function GET(req: NextRequest) {
  const user = req.cookies.get('user')?.value
  if (!user) return NextResponse.json([], { status: 200 })
  const all = await loadAll()
  return NextResponse.json(all[user] || [])
}

export async function POST(req: NextRequest) {
  const user = req.cookies.get('user')?.value
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { text } = await req.json()
  const all = await loadAll()
  const list = all[user] || []
  const task = { id: Date.now(), text, done: false }
  all[user] = [...list, task]
  await saveAll(all)
  return NextResponse.json(task)
}

export async function PUT(req: NextRequest) {
  const user = req.cookies.get('user')?.value
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { id, done, text } = await req.json()
  const all = await loadAll()
  const list = all[user] || []
  const task = list.find(t => t.id === id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (typeof done === 'boolean') task.done = done
  if (typeof text === 'string')  task.text = text
  all[user] = list
  await saveAll(all)
  return NextResponse.json(task)
}

export async function DELETE(req: NextRequest) {
  const user = req.cookies.get('user')?.value
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const id = Number(new URL(req.url).searchParams.get('id'))
  const all = await loadAll()
  all[user] = (all[user] || []).filter((t: any) => t.id !== id)
  await saveAll(all)
  return NextResponse.json({ ok: true })
}
