// src/app/dashboard/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Circle } from 'react-feather'
import { v4 as uuidv4 } from 'uuid'

type Priority = 'High' | 'Medium' | 'Low'
type Status   = 'Not Started' | 'In Progress' | 'Completed'

interface Task {
  id: string
  title: string
  notes?: string
  due?: string
  priority: Priority
  status: Status
  image?: string
  created: string
}

export default function TasksPage() {
  // — Form state —
  const [showForm, setShowForm] = useState(false)
  const [title,   setTitle]    = useState('')
  const [notes,   setNotes]    = useState('')
  const [due,     setDue]      = useState('')
  const [priority,setPriority] = useState<Priority>('Medium')
  const [status,  setStatus]   = useState<Status>('Not Started')
  const [file,    setFile]     = useState<File | null>(null)

  // — Tasks + filter —
  const [tasks,  setTasks]  = useState<Task[]>([])
  const [filter, setFilter] = useState('')

  // 1️⃣ Load saved tasks on mount
  useEffect(() => {
    const raw = window.localStorage.getItem('todo_tasks')
    if (raw) {
      try {
        setTasks(JSON.parse(raw))
      } catch (_) {}
    }
  }, [])

  // 2️⃣ Save whenever tasks change
  useEffect(() => {
    window.localStorage.setItem('todo_tasks', JSON.stringify(tasks))
  }, [tasks])

  // — Stats for graphs —
  const counts = {
    Completed:     tasks.filter(t=>t.status==='Completed').length,
    'In Progress': tasks.filter(t=>t.status==='In Progress').length,
    'Not Started': tasks.filter(t=>t.status==='Not Started').length,
  }
  const total = tasks.length || 1

  // — Create new task —
  const createTask = () => {
    if (!title.trim()) return
    const imgUrl = file ? URL.createObjectURL(file) : undefined
    const t: Task = {
      id: uuidv4(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      due: due || undefined,
      priority, status,
      image: imgUrl,
      created: new Date().toISOString(),
    }
    setTasks([t, ...tasks])
    // reset form
    setTitle(''); setNotes(''); setDue('')
    setPriority('Medium'); setStatus('Not Started'); setFile(null)
    setShowForm(false)
  }

  const deleteTask = (id:string) => setTasks(tasks.filter(t=>t.id!==id))

  const markComplete = (id:string) => {
    if (!confirm('Mark this task as completed?')) return
    setTasks(tasks.map(t=>t.id===id?{...t,status:'Completed'}:t))
  }

  return (
    <div className="flex space-x-6 p-6">
      {/* — Left Column: To-Do & Form — */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">To-Do</h2>
          <button
            onClick={()=>setShowForm(!showForm)}
            className="text-pink-600 hover:underline"
          >
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-4 rounded shadow space-y-3 border">
            <input
              type="text" placeholder="Title…"
              value={title} onChange={e=>setTitle(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
            <textarea
              placeholder="Notes…"
              value={notes} onChange={e=>setNotes(e.target.value)}
              rows={2}
              className="w-full border px-2 py-1 rounded"
            />
            <div className="flex space-x-3 items-center">
              <input
                type="datetime-local"
                value={due} onChange={e=>setDue(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <select
                value={priority} onChange={e=>setPriority(e.target.value as Priority)}
                className="border px-2 py-1 rounded"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select
                value={status} onChange={e=>setStatus(e.target.value as Status)}
                className="border px-2 py-1 rounded"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <input
                type="file"
                onChange={e=>setFile(e.target.files?.[0]||null)}
              />
            </div>
            <button
              onClick={createTask}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Create
            </button>
          </div>
        )}

        <input
          type="text" placeholder="Search tasks…"
          value={filter} onChange={e=>setFilter(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="space-y-2">
          {tasks
            .filter(t=>t.title.toLowerCase().includes(filter.toLowerCase()))
            .map(t=>(
            <div
              key={t.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow border"
            >
              <div>
                <h3 className="font-medium">{t.title}</h3>
                <div className="flex text-sm text-gray-600 space-x-4 mt-1 items-center">
                  <Circle
                    size={14}
                    className={ t.status==='Completed'?'text-green-500':'text-red-500' }
                  />
                  <span>{new Date(t.due||t.created).toLocaleString()}</span>
                  <span>· {t.priority}</span>
                  <span>· {t.status}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {t.image && (
                  <img
                    src={t.image}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                {t.status!=='Completed' && (
                  <button
                    onClick={()=>markComplete(t.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={()=>deleteTask(t.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
          {tasks.filter(t=>t.title.toLowerCase().includes(filter.toLowerCase())).length===0 && (
            <p className="text-gray-500">No matching tasks.</p>
          )}
        </div>
      </div>

      {/* — Right Column: Stats, Calendar, Completed — */}
      <div className="w-80 space-y-4">
        {/* Stats */}
        <div className="bg-white p-4 rounded shadow border">
          <h4 className="font-semibold mb-2">Task Status</h4>
          <div className="flex justify-between">
            {(['Completed','In Progress','Not Started'] as const).map(key=>(
              <div key={key} className="flex flex-col items-center">
                <svg className="w-16 h-16" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      key==='Completed'    ? 'text-green-500' :
                      key==='In Progress'  ? 'text-blue-500'  :
                                             'text-red-500'
                    }
                    strokeDasharray={`${(counts[key]/total)*100} 100`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="text-sm mt-1">{key}</span>
                <span className="text-xs text-gray-500">
                  {Math.round((counts[key]/total)*100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-4 rounded shadow border">
          <h4 className="font-semibold mb-2">Calendar</h4>
          <Calendar />
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-4 rounded shadow border">
          <h4 className="font-semibold mb-2">Completed Tasks</h4>
          {tasks.filter(t=>t.status==='Completed').length===0
            ? <p className="text-gray-500">No completed tasks yet.</p>
            : tasks.filter(t=>t.status==='Completed').map(t=>(
              <div key={t.id} className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-medium">{t.title}</h5>
                  <span className="text-xs text-gray-500">
                    Done on {new Date(t.created).toLocaleDateString()}
                  </span>
                </div>
                {t.image && (
                  <img
                    src={t.image}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
