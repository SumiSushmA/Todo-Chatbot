import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI must be set')
}

let cached: {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
} = { conn: null, promise: null }

export default async function connectToDatabase() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // as of mongoose 7+ these two are true by default:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
