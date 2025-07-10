// src/lib/embeddings.js
import fs from 'fs'
import path from 'path'

const raw = fs.readFileSync(
  path.join(process.cwd(), 'data/cluster_tasks.json'),
  'utf8'
)
const tasks = JSON.parse(raw)

// 1) Turn each task into a little document string
export const documents = tasks.map(
  (t) => `Cluster ${t.cluster}: ${t.task}`
)

// 2) We'll fill this in at startup
export let embeddings = []

;(async () => {
  const API_KEY = process.env.GEMINI_API_KEY
  const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/` +
                    `gemini-embedding-exp-03-07:embedContent?key=${API_KEY}`

  embeddings = await Promise.all(
    documents.map(async (doc) => {
      const res = await fetch(EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: doc }] }
        })
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('Embedding error:', json)
        return []
      }
      // the REST returns either `.embedding.value` or `.embedding.values`
      return json.embedding.value || json.embedding.values
    })
  )
  console.log(`👉 Indexed ${embeddings.length} cluster-tasks via Gemini REST`)
})()
