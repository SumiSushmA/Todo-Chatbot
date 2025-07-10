'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

type Priority = 'high' | 'medium' | 'low'

interface Task {
  id: string
  title: string
  priority: Priority
  due?: string       // ISO string from datetime-local
  notes?: string
  attachments: File[]
  completed: boolean
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-200 border-red-400 text-red-800',
  medium: 'bg-orange-200 border-orange-400 text-orange-800',
  low: 'bg-green-200 border-green-400 text-green-800',
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [due, setDue] = useState('')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('todo_tasks')
    if (raw) {
      try {
        const arr: Task[] = JSON.parse(raw).map((t: any) => ({
          ...t,
          attachments: [], // we can’t restore File objects, so drop them
        }))
        setTasks(arr)
      } catch {}
    }
  }, [])

  // Persist on tasks change
  useEffect(() => {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks))
  }, [tasks])

  // notify overdue on mount
  useEffect(() => {
    const now = new Date()
    const overdue = tasks.filter(t => t.due && new Date(t.due) < now && !t.completed)
    if (overdue.length) {
      alert(`⚠️ You have ${overdue.length} overdue task(s)!`)
    }
  }, []) // only once

  const addTask = () => {
    if (!title.trim()) return
    setTasks([
      ...tasks,
      {
        id: uuidv4(),
        title: title.trim(),
        priority,
        due: due || undefined,
        notes: notes || undefined,
        attachments: files,
        completed: false,
      },
    ])
    // reset form
    setTitle('')
    setPriority('medium')
    setDue('')
    setNotes('')
    setFiles([])
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  return (
    <div className="space-y-6">
      {/* --- New Task Form --- */}
      <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
        <input
          type="text"
          placeholder="Task title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex space-x-2">
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="border p-2 rounded"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Due</label>
            <input
              type="datetime-local"
              value={due}
              onChange={e => setDue(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Attachments</label>
          <input
            type="file"
            multiple
            onChange={e => {
              if (e.target.files) {
                setFiles(Array.from(e.target.files))
              }
            }}
          />
        </div>

        <button
          onClick={addTask}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>

      {/* --- Task List --- */}
      <div className="space-y-4">
        {tasks.map(task => {
          const isOverdue = task.due ? new Date(task.due) < new Date() : false
          return (
            <div
              key={task.id}
              className={`p-4 border rounded-lg flex justify-between items-start ${
                task.completed ? 'opacity-50 line-through' : ''
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />
                  <h3 className="font-medium">{task.title}</h3>
                  {isOverdue && !task.completed && (
                    <span className="text-red-600 font-semibold">OVERDUE</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block text-sm px-2 py-0.5 border rounded ${PRIORITY_COLORS[task.priority]}`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  {task.due && (
                    <span className="text-sm text-gray-600">
                      Due: {new Date(task.due).toLocaleString()}
                    </span>
                  )}
                </div>

                {task.notes && (
                  <p className="text-sm bg-gray-100 p-2 rounded">{task.notes}</p>
                )}

                {task.attachments.length > 0 && (
                  <ul className="text-sm">
                    {task.attachments.map((f, i) => (
                      <li key={i} className="underline">
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <p className="text-gray-500">No tasks yet…</p>
        )}
      </div>
    </div>
  )
}
