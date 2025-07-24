import TaskModel from '@/lib/models/Task'
import connectToDatabase from '@/lib/mongodb'
import { NextResponse } from 'next/server'

export async function GET() {
  await connectToDatabase()
  const tasks = await TaskModel.find().sort({ dueDateTime: 1 })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  await connectToDatabase()
  const payload = await req.json()
  const task = await TaskModel.create(payload)
  return NextResponse.json(task, { status: 201 })
}

export async function PUT(req: Request) {
  await connectToDatabase()
  const { _id, ...rest } = await req.json()
  const task = await TaskModel.findByIdAndUpdate(_id, rest, { new: true })
  return NextResponse.json(task)
}

export async function DELETE(req: Request) {
  await connectToDatabase()
  const { _id } = await req.json()
  await TaskModel.findByIdAndDelete(_id)
  return NextResponse.json({ ok: true })
}

