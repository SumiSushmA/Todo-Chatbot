// src/app/dashboard/tasks/page.tsx
'use client'

import { FormEvent, useEffect, useState } from 'react'
import Calendar, { CalendarProps } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

type Priority = 'Low' | 'Medium' | 'High'
type Status   = 'not-started' | 'in-progress' | 'completed'
type CalValue = CalendarProps['value']

interface Task {
  _id?: string
  title: string
  note: string
  dueDateTime: string
  priority: Priority
  status: Status
}

export default function TasksPage() {
  // ─── State ─────────────────────────────────────────────────────────
  const [tasks, setTasks]         = useState<Task[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Task|null>(null)

  const [title, setTitle]         = useState('')
  const [note, setNote]           = useState('')
  const [due, setDue]             = useState<Date>(new Date())
  const [priority, setPriority]   = useState<Priority>('Low')
  const [status, setStatus]       = useState<Status>('not-started')

  // ─── Load tasks ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then((ts: Task[]) => setTasks(ts))
      .catch(console.error)
  }, [])

  // ─── Handlers ───────────────────────────────────────────────────────
  function openAdd() {
    setEditing(null)
    setTitle(''); setNote(''); setDue(new Date())
    setPriority('Low'); setStatus('not-started')
    setModalOpen(true)
  }

  function openEdit(t: Task) {
    setEditing(t)
    setTitle(t.title)
    setNote(t.note)
    setDue(new Date(t.dueDateTime))
    setPriority(t.priority)
    setStatus(t.status)
    setModalOpen(true)
  }

  async function saveTask(e: FormEvent) {
    e.preventDefault()
    const payload = editing
      ? { _id: editing._id, title, note, dueDateTime: due.toISOString(), priority, status }
      : { title, note, dueDateTime: due.toISOString(), priority, status }

    await fetch('/api/tasks', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setModalOpen(false)
    // reload
    const ts = await fetch('/api/tasks').then(r => r.json())
    setTasks(ts)
  }

  async function deleteTask(id: string) {
    if (!confirm('Delete this task?')) return
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id }),
    })
    setTasks(tasks.filter(t => t._id !== id))
  }

  // ─── Chart data ────────────────────────────────────────────────────
  const prioCounts = { Low: 0, Medium: 0, High: 0 }
  tasks.forEach(t => prioCounts[t.priority]++)
  const barData = [
    { name: 'Low',    count: prioCounts.Low    },
    { name: 'Medium', count: prioCounts.Medium },
    { name: 'High',   count: prioCounts.High   },
  ]

  // ─── Completed list ───────────────────────────────────────────────
  const completed = tasks.filter(t => t.status === 'completed')

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left (2/3) Task List ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {tasks.length === 0 && (
            <p className="text-gray-500">No tasks yet.</p>
          )}
          {tasks.map(t => (
            <div
              key={t._id}
              className="bg-white p-4 rounded shadow flex justify-between"
            >
              <div>
                <h2 className="font-semibold">{t.title}</h2>
                <p className="text-gray-600">{t.note}</p>
                <p className="text-xs text-gray-500">
                  Due: {new Date(t.dueDateTime).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right space-y-2">
                <span className="inline-block px-2 py-1 bg-gray-200 rounded text-xs">
                  {t.status.replace('-', ' ')}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => t._id && deleteTask(t._id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Right (1/3) Chart / Calendar / Completed ───────── */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white p-4 rounded shadow flex-1">
            <h3 className="font-medium mb-2">Priority Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white p-4 rounded shadow flex-1">
            <h3 className="font-medium mb-2">Calendar</h3>
            <Calendar
              className="w-full"
              onChange={(value: CalValue, _evt) => {
                if (value instanceof Date) setDue(value)
              }}
              value={due}
            />
          </div>

          {/* Completed */}
          <div className="bg-white p-4 rounded shadow flex-1 overflow-auto">
            <h3 className="font-medium mb-2">Completed Tasks</h3>
            {completed.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {completed.map(t => (
                  <li key={t._id}>{t.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No completed tasks yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal ───────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              {editing ? 'Edit Task' : 'New Task'}
            </h2>
            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Note</label>
                <textarea
                  required
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <Calendar
                  onChange={(value: CalValue, _evt) => {
                    if (value instanceof Date) setDue(value)
                  }}
                  value={due}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="mt-1 w-full border rounded px-2 py-1"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Status)}
                    className="mt-1 w-full border rounded px-2 py-1"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
