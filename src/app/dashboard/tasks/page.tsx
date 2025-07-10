// 'use client'
// import { useEffect, useState } from 'react';

// type Task = { id:number; text:string; done:boolean }

// export default function TasksPage() {
//   const [tasks, setTasks] = useState<Task[]>([])
//   const [text, setText] = useState('')

//   useEffect(() => {
//     fetch('/api/tasks').then(r=>r.json()).then(setTasks)
//   }, [])

//   const add = async () => {
//     if (!text.trim()) return
//     const res = await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text.trim()})})
//     const t = await res.json()
//     setTasks(prev=>[...prev,t])
//     setText('')
//   }

//   const toggle = async (t:Task) => {
//     if (!confirm(`Mark this task as ${t.done? 'not done':'done'}?`)) return
//     const res = await fetch('/api/tasks',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,done:!t.done})})
//     const u = await res.json()
//     setTasks(prev=>prev.map(x=>x.id===u.id?u:x))
//   }

//   const edit = async (t:Task) => {
//     const txt = prompt('Edit task',t.text)
//     if (txt!=null&&txt.trim()){
//       if (!confirm('Save changes?')) return
//       const res = await fetch('/api/tasks',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,text:txt.trim()})})
//       const u = await res.json()
//       setTasks(prev=>prev.map(x=>x.id===u.id?u:x))
//     }
//   }

//   const del = async (id:number) => {
//     if (!confirm('Delete this task?')) return
//     await fetch(`/api/tasks?id=${id}`,{method:'DELETE'})
//     setTasks(prev=>prev.filter(x=>x.id!==id))
//   }

//   return (
//     <div>
//       <h2 style={{fontSize:20,marginBottom:16}}>Your Tasks</h2>
//       <div style={{display:'flex',marginBottom:16}}>
//         <input value={text} onChange={e=>setText(e.target.value)} placeholder="New task…" style={{flex:1,padding:8,border:'1px solid #ccc',borderRadius:4}} />
//         <button onClick={add} style={{marginLeft:8,background:'#48bb78',color:'#fff',padding:'0 16px',border:'none',borderRadius:4}}>Add</button>
//       </div>
//       <ul style={{listStyle:'none',padding:0}}>
//         {tasks.map(t=>(
//           <li key={t.id} style={{display:'flex',alignItems:'center',marginBottom:8}}>
//             <input type="checkbox" checked={t.done} onChange={()=>toggle(t)} />
//             <span style={{marginLeft:8,flex:1,textDecoration:t.done?'line-through':'none'}}>{t.text}</span>
//             <button onClick={()=>edit(t)} style={{background:'none',border:'none',color:'#d69e2e',cursor:'pointer',marginRight:8}}>Edit</button>
//             <button onClick={()=>del(t.id)} style={{background:'none',border:'none',color:'#e53e3e',cursor:'pointer'}}>✕</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

// src/app/dashboard/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

type Priority = 'high' | 'medium' | 'low'

interface Task {
  id: string
  title: string
  priority: Priority
  due?: string      // ISO datetime
  notes?: string
  attachments: string[]
  completed: boolean
}

const PRIORITY_BADGES: Record<Priority, string> = {
  high:   'bg-red-200 border-red-400 text-red-800',
  medium: 'bg-orange-200 border-orange-400 text-orange-800',
  low:    'bg-green-200 border-green-400 text-green-800',
}

export default function TasksPage() {
  // form state
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [due, setDue] = useState('')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)

  // tasks state
  const [tasks, setTasks] = useState<Task[]>([])

  // load on mount
  useEffect(() => {
    const raw = localStorage.getItem('todo_tasks')
    if (raw) {
      try {
        setTasks(JSON.parse(raw))
      } catch {
        console.error('failed to parse tasks')
      }
    }
  }, [])

  // save on change
  useEffect(() => {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!title.trim()) return
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      priority,
      due: due || undefined,
      notes: notes || undefined,
      attachments: files ? Array.from(files).map(f => f.name) : [],
      completed: false,
    }
    setTasks([newTask, ...tasks])
    // reset form
    setTitle('')
    setPriority('medium')
    setDue('')
    setNotes('')
    setFiles(null)
  }

  const deleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  return (
    <div className="h-full p-6 bg-white rounded-lg shadow flex flex-col space-y-6">
      {/* — Add Task Form — */}
      <div className="bg-gray-50 p-5 rounded-lg border space-y-4">
        <input
          type="text"
          placeholder="Task title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex space-x-4">
          <div>
            <label className="block mb-1">Priority</label>
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
            <label className="block mb-1">Due date & time</label>
            <input
              type="datetime-local"
              value={due}
              onChange={e => setDue(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Attachments</label>
          <input
            type="file"
            multiple
            onChange={e => setFiles(e.target.files)}
          />
        </div>

        <button
          onClick={addTask}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>

      {/* — Tasks List — */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {tasks.length === 0 && (
          <p className="text-gray-500">You have no tasks yet.</p>
        )}
        {tasks.map(task => {
          const isOverdue = task.due
            ? new Date(task.due) < new Date() && !task.completed
            : false

          return (
            <div
              key={task.id}
              className="relative bg-white p-5 rounded-lg border shadow"
            >
              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>

              {/* Completed toggle */}
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
                <span
                  className={`text-lg font-medium ${
                    task.completed ? 'line-through opacity-50' : ''
                  }`}
                >
                  {task.title}
                </span>
              </label>

              {/* Priority & Due */}
              <div className="flex items-center space-x-3 text-sm mb-2">
                <span
                  className={`px-2 py-0.5 border rounded ${PRIORITY_BADGES[
                    task.priority
                  ]}`}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </span>
                {task.due && (
                  <span className="text-gray-600">
                    Due: {new Date(task.due).toLocaleString()}
                  </span>
                )}
                {isOverdue && (
                  <span className="text-red-600 font-semibold">OVERDUE</span>
                )}
              </div>

              {/* Notes */}
              {task.notes && (
                <p className="text-sm bg-gray-50 p-3 rounded mb-2">
                  {task.notes}
                </p>
              )}

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <ul className="text-sm space-y-1">
                  {task.attachments.map((n, i) => (
                    <li key={i} className="underline">
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}