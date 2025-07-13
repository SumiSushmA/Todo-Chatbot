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

// cosine similarity helper
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] || 0) * (b[i] || 0)
    na  += (a[i] || 0) ** 2
    nb  += (b[i] || 0) ** 2
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

// Euclidean nearest‐neighbor (for generic queries)
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

  // —— A) “Why did you pick cluster N?” ——
  let m
  if ((m = lastUser.match(/why did you pick cluster\s+(\d+)/i))) {
    const n = Number(m[1])
    // embed the query
    const er = await fetch(EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
    })
    const ej = await er.json()
    if (!er.ok || !ej.embedding) {
      return NextResponse.json({ content: `Sorry, I can’t explain right now.` })
    }
    const qEmb = ej.embedding.value || ej.embedding.values
    const pct  = (cosine(qEmb, embeddings[n]) * 100).toFixed(1)
    const task = documents[n].replace(/^Cluster \d+:\s*/, '')
    return NextResponse.json({
      content: `Cluster ${n} (“${task}”) was chosen because it had the highest semantic similarity (${pct}%) to your request.`
    })
  }

  // —— B) “Explain why cluster N is relevant” ——
  if ((m = lastUser.match(/(?:explain why|why).*cluster\s+(\d+).*relevant/i))) {
    const n = Number(m[1])
    const er = await fetch(EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
    })
    const ej = await er.json()
    if (!er.ok || !ej.embedding) {
      return NextResponse.json({ content: `Sorry, I can’t explain right now.` })
    }
    const qEmb = ej.embedding.value || ej.embedding.values
    const pct  = (cosine(qEmb, embeddings[n]) * 100).toFixed(1)
    const task = documents[n].replace(/^Cluster \d+:\s*/, '')
    return NextResponse.json({
      content: `Cluster ${n} (“${task}”) matches your query with ${pct}% semantic similarity, so it’s most relevant.`
    })
  }

  // —— C) “What data led you to choose cluster N?” ——
  if ((m = lastUser.match(/what data led you to choose cluster\s+(\d+)/i))) {
    const n = Number(m[1])
    const er = await fetch(EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
    })
    const ej = await er.json()
    if (!er.ok || !ej.embedding) {
      return NextResponse.json({ content: `Sorry, I can’t retrieve that data right now.` })
    }
    const qEmb = ej.embedding.value || ej.embedding.values
    const pct  = (cosine(qEmb, embeddings[n]) * 100).toFixed(1)
    return NextResponse.json({
      content: `The choice was based on a semantic similarity of ${pct}% between your query and Cluster ${n}.`
    })
  }

  // —— D) “How similar is my query to cluster N?” ——
  if ((m = lastUser.match(/how similar.*cluster\s+(\d+)/i))) {
    const n = Number(m[1])
    const er = await fetch(EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
    })
    const ej = await er.json()
    if (!er.ok || !ej.embedding) {
      return NextResponse.json({ content: `Sorry, I can’t compute similarity right now.` })
    }
    const qEmb = ej.embedding.value || ej.embedding.values
    const pct  = (cosine(qEmb, embeddings[n]) * 100).toFixed(1)
    return NextResponse.json({
      content: `Your query is ${pct}% similar to Cluster ${n}.`
    })
  }

  // —— 1) Direct “cluster N” lookup —— 
  if ((m = lastUser.match(/cluster\s+(\d+)/i))) {
    const n = Number(m[1])
    const doc = documents.find(d => d.startsWith(`Cluster ${n}:`))
    if (doc) {
      const answer = doc.replace(/^Cluster \d+:\s*/, '')
      return NextResponse.json({ content: answer })
    }
  }

  // —— 2) Otherwise, embed & pick top-3 docs —— 
  const embRes  = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text: lastUser }] } })
  })
  const embJson = await embRes.json()
  if (!embRes.ok || !embJson.embedding) {
    console.error('Embedding error:', embJson)
    return NextResponse.json({ content: `Sorry, I couldn’t process that.` }, { status: 500 })
  }
  const qEmb = embJson.embedding.value || embJson.embedding.values

  const top3    = findNearest(embeddings, qEmb, 3)
  const context = top3.map(i => documents[i]).join('\n\n')
  const promptText =
    `Use only this information to answer:\n\n${context}\n\nQ: ${lastUser}`

  // —— 3) Call Gemini chat with that context —— 
  const chatRes  = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
  })
  const chatJson = await chatRes.json()
  if (!chatRes.ok) {
    console.error('Chat API failed:', chatJson)
    return NextResponse.json({ content: `Sorry, I couldn’t get an answer.` }, { status: 500 })
  }

  // —— 4) Flatten & return —— 
  const cand = chatJson.candidates?.[0]?.content
  const answer = Array.isArray(cand?.parts)
    ? cand.parts.map(p => p.text).join('')
    : cand?.text || ''

  return NextResponse.json({ content: answer.trim() })
}
