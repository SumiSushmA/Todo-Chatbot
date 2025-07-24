// src/lib/models/Thread.ts
import mongoose, { Document, Model } from 'mongoose'

export interface IMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export interface IThread extends Document {
  thread: string
  updated: string
  messages: IMessage[]
}

const MessageSchema = new mongoose.Schema<IMessage>(
  {
    role:    { type: String, enum: ['user','assistant'], required: true },
    content: { type: String, required: true },
    ts:      { type: String, required: true },
  },
  { _id: false }
)

const ThreadSchema = new mongoose.Schema<IThread>({
  thread:   { type: String, required: true },
  updated:  { type: String, required: true },
  messages: { type: [MessageSchema], required: true },
})

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema)

export default Thread
