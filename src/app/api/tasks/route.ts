// src/app/api/tasks/route.ts
import { loadAll, saveAll, Task } from '@/lib/tasks'
import { NextResponse } from 'next/server'

export async function GET() {
  const store = await loadAll()
  return NextResponse.json(store.tasks)
}

export async function POST(request: Request) {
  const { task } = (await request.json()) as { task: Task }
  const store = await loadAll()
  const idx = store.tasks.findIndex(t => t.id === task.id)
  if (idx > -1) store.tasks[idx] = task
  else store.tasks.push(task)
  await saveAll(store)
  return NextResponse.json({ success: true, task })
}

export async function DELETE(request: Request) {
  const { id } = (await request.json()) as { id: string }
  const store = await loadAll()
  store.tasks = store.tasks.filter(t => t.id !== id)
  await saveAll(store)
  return NextResponse.json({ success: true })
}


