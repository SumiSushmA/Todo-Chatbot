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
