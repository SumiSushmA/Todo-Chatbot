// // src/app/api/tasks/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { loadAll, saveAll } from '../../../lib/tasks'

// export async function GET(req: NextRequest) {
//   const user = req.cookies.get('user')?.value
//   if (!user) return NextResponse.json([], { status: 200 })
//   const all = await loadAll()
//   return NextResponse.json(all[user] || [])
// }

// export async function POST(req: NextRequest) {
//   const user = req.cookies.get('user')?.value
//   if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
//   const { text } = await req.json()
//   const all = await loadAll()
//   const list = all[user] || []
//   const task = { id: Date.now(), text, done: false }
//   all[user] = [...list, task]
//   await saveAll(all)
//   return NextResponse.json(task)
// }

// export async function PUT(req: NextRequest) {
//   const user = req.cookies.get('user')?.value
//   if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
//   const { id, done, text } = await req.json()
//   const all = await loadAll()
//   const list = all[user] || []
//   const task = list.find(t => t.id === id)
//   if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//   if (typeof done === 'boolean') task.done = done
//   if (typeof text === 'string')  task.text = text
//   all[user] = list
//   await saveAll(all)
//   return NextResponse.json(task)
// }

// export async function DELETE(req: NextRequest) {
//   const user = req.cookies.get('user')?.value
//   if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
//   const id = Number(new URL(req.url).searchParams.get('id'))
//   const all = await loadAll()
//   all[user] = (all[user] || []).filter((t: any) => t.id !== id)
//   await saveAll(all)
//   return NextResponse.json({ ok: true })
// }


// src/app/api/tasks/route.js
// @ts-nocheck

import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

// 1) On server startup, load & map your cluster_tasks.json
const raw = fs.readFileSync(
  path.join(process.cwd(), 'data/cluster_tasks.json'),
  'utf8'
)
const initial = JSON.parse(raw).map(({ cluster, task }) => ({
  id: `cluster-${cluster}`,
  text: `Cluster ${cluster}: ${task}`,
  done: false
}))

// 2) Keep it in-memory (you can swap in a DB later)
let tasks = [...initial]

export async function GET() {
  return NextResponse.json(tasks)
}

export async function POST(req) {
  const { text } = await req.json()
  const newTask = { id: Date.now().toString(), text, done: false }
  tasks.unshift(newTask)
  return NextResponse.json(newTask, { status: 201 })
}

export async function PUT(req) {
  const { id } = req.nextUrl.searchParams
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
  return NextResponse.json({ success: true })
}

export async function DELETE(req) {
  const { id } = req.nextUrl.searchParams
  tasks = tasks.filter(t => t.id !== id)
  return NextResponse.json({ success: true })
}
