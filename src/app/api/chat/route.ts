// // src/app/api/chat/route.js
// // @ts-nocheck
// import { documents, embeddings } from '@/lib/embeddings'
// import { NextResponse } from 'next/server'

// const API_KEY = process.env.GEMINI_API_KEY
// const EMBED_URL =
//   `https://generativelanguage.googleapis.com/v1beta/models/` +
//   `gemini-embedding-exp-03-07:embedContent?key=${API_KEY}`
// const CHAT_URL =
//   `https://generativelanguage.googleapis.com/v1beta/models/` +
//   `gemini-2.5-flash:generateContent?key=${API_KEY}`

// /** Euclidean nearest‐neighbor on arrays of numbers */
// function findNearest(corpus, query, k) {
//   return corpus
//     .map((vec, i) => {
//       let dist = 0
//       for (let j = 0; j < (vec?.length || 0); j++) {
//         const d = (vec[j] || 0) - (query[j] || 0)
//         dist += d * d
//       }
//       return { idx: i, dist }
//     })
//     .sort((a, b) => a.dist - b.dist)
//     .slice(0, k)
//     .map((o) => o.idx)
// }

// export async function POST(req) {
//   const { messages } = await req.json()
//   const lastUser =
//     Array.isArray(messages)
//       ? messages.filter((m) => m.sender === 'user').pop()?.text.trim() || ''
//       : ''

//   // 1) Embed the user query
//   const embRes = await fetch(EMBED_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
//   })
//   const embJson = await embRes.json()
//   if (!embRes.ok || !embJson.embedding) {
//     console.error('Embedding query failed:', embJson)
//     return NextResponse.json(
//       { content: '', error: 'Embedding query failed' },
//       { status: 500 }
//     )
//   }
//   const qEmb = embJson.embedding.value || embJson.embedding.values

//   // 2) Pick top-3 closest cluster tasks
//   const top3 = findNearest(embeddings, qEmb, 3)
//   const context = top3.map((i) => documents[i]).join('\n\n')

//   // 3) Build the simple “contents” payload for REST
//   const contents = [
//     { parts: [{ text: `Use only this information:\n\n${context}\n\nQ: ${lastUser}` }] }
//   ]

//   // 4) Call Gemini generateContent
//   const chatRes = await fetch(CHAT_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ contents })
//   })
//   const chatJson = await chatRes.json()
//   if (!chatRes.ok) {
//     console.error('Chat API failed:', chatJson)
//     return NextResponse.json(
//       { content: '', error: 'Chat API failed' },
//       { status: 500 }
//     )
//   }

//   // 5) Flatten and return the answer
//   const cand = chatJson.candidates?.[0]?.content
//   const answer = Array.isArray(cand?.parts)
//     ? cand.parts.map((p) => p.text).join('')
//     : cand?.text || ''

//   return NextResponse.json({ content: answer.trim() })
// }
// src/app/api/chat/route.js
// @ts-nocheck
import { documents, embeddings } from '@/lib/embeddings'
import { NextResponse } from 'next/server'

const API_KEY = process.env.GEMINI_API_KEY
const EMBED_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-embedding-exp-03-07:embedContent?key=${API_KEY}`
const CHAT_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/` +
  `gemini-2.5-flash:generateContent?key=${API_KEY}`

/** Euclidean nearest-neighbor */
function findNearest(corpus, query, k) {
  return corpus
    .map((vec, i) => {
      let dist = 0
      for (let j = 0; j < (vec?.length || 0); j++) {
        const d = (vec[j] || 0) - (query[j] || 0)
        dist += d * d
      }
      return { idx: i, dist }
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
    .map((o) => o.idx)
}

export async function POST(req) {
  const { messages } = await req.json()
  const lastUser = Array.isArray(messages)
    ? messages.filter((m) => m.sender === 'user').pop()?.text.trim() || ''
    : ''

  // —— 1) Direct “cluster N” lookup —— 
  const m = lastUser.match(/cluster\s+(\d+)/i)
  if (m) {
    const n = Number(m[1])
    const doc = documents.find((d) => d.startsWith(`Cluster ${n}:`))
    if (doc) {
      // strip off “Cluster N: ”
      const answer = doc.replace(/^Cluster \d+:\s*/, '')
      return NextResponse.json({ content: answer })
    }
  }

  // —— 2) Otherwise, embed via Gemini REST
  const embRes = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
  })
  const embJson = await embRes.json()
  if (!embRes.ok || !embJson.embedding) {
    console.error('Embedding error:', embJson)
    return NextResponse.json({ content: '', error: 'Embedding query failed' }, { status: 500 })
  }
  const qEmb = embJson.embedding.value || embJson.embedding.values

  // —— 3) Nearest-neighbor to pick top‐3 docs —— 
  const top3 = findNearest(embeddings, qEmb, 3)
  const context = top3.map((i) => documents[i]).join('\n\n')

  // —— 4) Ask Gemini chat with that context —— 
  const promptText = 
    `Use only this information to answer:\n\n${context}\n\nQ: ${lastUser}`

  const chatRes = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  })
  const chatJson = await chatRes.json()
  if (!chatRes.ok) {
    console.error('Chat API failed:', chatJson)
    return NextResponse.json({ content: '', error: 'Chat API failed' }, { status: 500 })
  }

  // —— 5) Flatten and return —— 
  const cand = chatJson.candidates?.[0]?.content
  const answer = Array.isArray(cand?.parts)
    ? cand.parts.map((p) => p.text).join('')
    : cand?.text || ''

  return NextResponse.json({ content: answer.trim() })
}
