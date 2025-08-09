'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  onSendMessage: (text: string) => void
  lastBotReply?: string
  /** unique key for the last bot message, e.g. `${threadId}:${lastBotIndex}` */
  lastKey?: string
  /** speak only when true AND lastKey changes */
  speak?: boolean
  /** parent should reset speak flag after we finish or cancel */
  onSpoken?: () => void
  lang?: string
}

export default function ChatVoice({
  onSendMessage,
  lastBotReply,
  lastKey,
  speak = false,
  onSpoken,
  lang = 'en-US',
}: Props) {
  const [supported, setSupported] = useState({ stt: false, tts: false })
  const [status, setStatus] = useState<'idle' | 'starting' | 'listening' | 'stopping'>('idle')
  const [interim, setInterim] = useState('')

  const recogRef = useRef<SpeechRecognition | null>(null)
  const spokenKeyRef = useRef<string | null>(null)
  const hardStopTimer = useRef<number | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Init STT once
  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported({ stt: !!SR, tts: !!window.speechSynthesis })
    if (!SR) return

    const r: SpeechRecognition = new SR()
    r.lang = lang
    r.interimResults = true
    r.continuous = true

    r.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '
        else interimText += t
      }
      setInterim(interimText)
      if (finalText.trim()) onSendMessage(finalText.trim())
    }

    r.onerror = () => {
      setStatus('idle')
      setInterim('')
    }
    r.onend = () => {
      setStatus('idle')
      setInterim('')
      if (hardStopTimer.current) {
        window.clearTimeout(hardStopTimer.current)
        hardStopTimer.current = null
      }
    }

    recogRef.current = r
    return () => {
      try { r.stop() } catch {}
    }
  }, [onSendMessage, lang])

  // Robust start
  const startMic = useCallback(async () => {
    if (!supported.stt || !recogRef.current || status !== 'idle') return
    setStatus('starting')
    try {
      try { await navigator.mediaDevices.getUserMedia({ audio: true }) } catch {}
      recogRef.current.start()
      setStatus('listening')
      window.speechSynthesis.cancel() // avoid feedback
    } catch (err: any) {
      setStatus('idle')
      if (err?.name === 'NotAllowedError') {
        alert('Microphone blocked. Click the lock icon near the URL and allow the mic.')
      }
    }
  }, [status, supported.stt])

  // Robust stop with abort fallback
  const stopMic = useCallback(() => {
    if (!recogRef.current) return
    if (status === 'idle') return
    setStatus('stopping')
    try { recogRef.current.stop() } catch {}
    if (hardStopTimer.current) window.clearTimeout(hardStopTimer.current)
    hardStopTimer.current = window.setTimeout(() => {
      try { recogRef.current?.abort?.() } catch {}
      setStatus('idle')
      setInterim('')
    }, 500) as unknown as number
  }, [status])

  const toggleMic = () => (status === 'listening' || status === 'starting' ? stopMic() : startMic())

  // Speak only when: speak=true AND lastKey changed AND we have text
  useEffect(() => {
    if (!supported.tts) return
    if (!speak || !lastKey || spokenKeyRef.current === lastKey) return
    if (!lastBotReply || !lastBotReply.trim()) return

    if (status !== 'idle') stopMic()
    window.speechSynthesis.cancel()

    const utter = new SpeechSynthesisUtterance(lastBotReply)
    utter.lang = lang
    utter.rate = 1
    utter.pitch = 1
    utter.onend = () => {
      spokenKeyRef.current = lastKey
      utterRef.current = null
      onSpoken?.()
    }
    utter.onerror = () => {
      spokenKeyRef.current = lastKey
      utterRef.current = null
      onSpoken?.()
    }
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [speak, lastKey, lastBotReply, supported.tts, status, stopMic, lang, onSpoken])

  const stopVoice = () => {
    window.speechSynthesis.cancel()
    utterRef.current = null
    onSpoken?.()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMic}
        disabled={!supported.stt}
        className={`px-3 py-2 rounded ${status === 'listening' || status === 'starting' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}
        title={supported.stt ? 'Click to talk / stop' : 'Voice not supported in this browser'}
      >
        {status === 'listening' || status === 'starting' ? '🛑 Stop Mic' : '🎤 Talk'}
      </button>

      <button
        onClick={stopVoice}
        disabled={!supported.tts}
        className="px-3 py-2 rounded bg-gray-700 text-white"
        title="Stop voice reply"
      >
        ⏹ Stop Voice
      </button>

      <div className="text-sm text-gray-600 min-h-[1.5rem]">
        {status === 'listening' ? (interim || 'Listening…') : ''}
      </div>
    </div>
  )
}
