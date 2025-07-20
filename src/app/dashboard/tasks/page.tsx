'use client'

import { Task } from '@/lib/tasks'
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { v4 as uuidv4 } from 'uuid'

export default function TasksPage() {
  // ─── State ────────────────────────────────────────────────
  const [tasks, setTasks]             = useState<Task[]>([])
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState<Task | null>(null)
  const [date, setDate]               = useState<Date>(new Date())

  // Form fields
  const [title, setTitle]             = useState('')
  const [note, setNote]               = useState('')
  const [dueDateTime, setDueDateTime] = useState('')
  const [priority, setPriority]       = useState<'Low'|'Medium'|'High'>('Medium')
  const [status, setStatus]           = useState<'not-started'|'in-progress'|'completed'>('not-started')
  const [imageData, setImageData]     = useState<string>()

  // ─── Fetch tasks ─────────────────────────────────────────
  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
      .catch(console.error)
  }, [])

  // ─── API helpers ─────────────────────────────────────────
  async function saveTask(t: Task) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ task: t }),
    })
  }
  async function deleteTask(id: string) {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ id }),
    })
    setTasks(ts => ts.filter(x => x.id !== id))
  }

  // ─── Image upload ────────────────────────────────────────
  function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return setImageData(undefined)
    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ─── Form controls ────────────────────────────────────────
  function startAdd() {
    setEditing(null)
    setTitle(''); setNote(''); setDueDateTime(''); setPriority('Medium')
    setStatus('not-started'); setImageData(undefined)
    setShowForm(true)
  }
  function startEdit(t: Task) {
    setEditing(t)
    setTitle(t.title)
    setNote(t.note)
    setDueDateTime(t.dueDateTime)
    setPriority(t.priority)
    setStatus(t.status)
    setImageData(t.image)
    setShowForm(true)
  }
  function clearForm() {
    setShowForm(false)
    setEditing(null)
  }
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const t: Task = {
      id: editing?.id || uuidv4(),
      title,
      note,
      dueDateTime,
      priority,
      status,
      image: imageData,
    }
    await saveTask(t)
    setTasks(ts => {
      const i = ts.findIndex(x => x.id === t.id)
      if (i > -1) { ts[i] = t; return [...ts] }
      return [...ts, t]
    })
    clearForm()
  }

  // ─── Quick complete ───────────────────────────────────────
  async function quickComplete(t: Task) {
    const upd = { ...t, status: 'completed' as const }
    await saveTask(upd)
    setTasks(ts => ts.map(x => x.id === t.id ? upd : x))
  }

  // ─── Calendar onChange ────────────────────────────────────
  const onCalendarChange = (v: any) => {
    if (v instanceof Date) setDate(v)
    else if (Array.isArray(v) && v[0] instanceof Date) setDate(v[0])
  }

  // ─── Split statuses ──────────────────────────────────────
  const todo   = tasks.filter(t => t.status !== 'completed')
  const done   = tasks.filter(t => t.status === 'completed')
  const inProg = tasks.filter(t => t.status === 'in-progress')
  const notSt  = tasks.filter(t => t.status === 'not-started')

  // ─── Prepare bar‐chart data ───────────────────────────────
  const barData = [
    { status: 'Completed',    count: done.length    },
    { status: 'In Progress',  count: inProg.length  },
    { status: 'Not Started',  count: notSt.length   },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
      <div className="flex w-full gap-6">

        {/* ─── Left Column (~2/3) ────────────────────────── */}
        <div className="flex-[2] space-y-4">
          <button onClick={startAdd} className="text-blue-600 hover:underline mb-2">
            + Add Task
          </button>

          {showForm && (
            <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow space-y-3">
              {/* Title, Note, datetime, priority & status selects, image upload, etc. */}
              {/* …same as before… */}
            </form>
          )}

          <ul className="space-y-4">
            {todo.map(t => (
              <li key={t.id} className="bg-white border rounded p-4 flex justify-between items-start shadow">
                {/* Task details + Complete / Edit / Delete */}
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Right Column (~1/3) ────────────────────────── */}
        <div className="flex-1 space-y-6">

          {/* ─── BAR CHART for statuses ────────────────────── */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Task Status</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ─── Calendar ─────────────────────────────── */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Calendar</h3>
            <Calendar onChange={onCalendarChange} value={date} />
          </div>

          {/* ─── Completed list ─────────────────────────── */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Completed Tasks</h3>
            {done.length === 0 ? (
              <p className="text-gray-500">No completed tasks yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {done.map(t => <li key={t.id}>{t.title}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
