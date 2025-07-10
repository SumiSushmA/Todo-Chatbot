// src/app/dashboard/tasks/list/page.tsx
'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Task = {
  id: string
  title: string
  priority: 'High' | 'Medium' | 'Low'
  due?: string            // ISO string
  notes?: string
  attachments?: string[]  // file names
  completed: boolean
  created: number         // timestamp
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  // load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('my_todo_tasks')
    if (raw) {
      try {
        setTasks(JSON.parse(raw))
      } catch {
        console.error('Could not parse tasks')
      }
    }
  }, [])

  // persist helper
  const save = (next: Task[]) => {
    setTasks(next)
    localStorage.setItem('my_todo_tasks', JSON.stringify(next))
  }

  const toggleComplete = (id: string) => {
    save(
      tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    )
  }

  const deleteTask = (id: string) => {
    if (!confirm('Delete this task forever?')) return
    save(tasks.filter(t => t.id !== id))
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Tasks</h1>
        <p className="text-gray-500">
          No tasks yet.{' '}
          <Link href="/dashboard/tasks" className="text-blue-600 underline">
            Add one
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Tasks</h1>
      <div className="space-y-4 max-h-[75vh] overflow-auto">
        {tasks.map(task => {
          const dueDate = task.due ? new Date(task.due) : null
          const isOverdue =
            dueDate != null && !task.completed && dueDate.getTime() < Date.now()

          // default attachments to an empty array
          const attachments = task.attachments ?? []

          let badgeColor = 'bg-green-100 text-green-800'
          if (task.priority === 'High')
            badgeColor = 'bg-red-100 text-red-800'
          else if (task.priority === 'Medium')
            badgeColor = 'bg-orange-100 text-orange-800'

          return (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between"
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="mt-1"
                />
                <div>
                  <h2
                    className={`${
                      task.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-900'
                    } text-lg font-medium`}
                  >
                    {task.title}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm mt-1">
                    <span className={`px-2 py-1 rounded ${badgeColor}`}>
                      {task.priority}
                    </span>
                    {dueDate && (
                      <span
                        className={`${
                          isOverdue ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        Due: {format(dueDate, 'Pp')}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="text-red-600 font-semibold">
                        Overdue!
                      </span>
                    )}
                  </div>
                  {task.notes && (
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {task.notes}
                    </p>
                  )}
                  {attachments.length > 0 && (
                    <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
                      {attachments.map((file, i) => (
                        <li key={i}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="mt-4 md:mt-0 text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
