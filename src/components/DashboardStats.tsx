'use client'

import { Task } from '@/lib/tasks'
import { useEffect, useState } from 'react'
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts'

export default function DashboardStats() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
      .catch(console.error)
  }, [])

  const total = tasks.length || 1  // avoid div/zero

  const stats = [
    {
      title: 'Not Started',
      count: tasks.filter(t => t.status === 'not-started').length,
      color: '#f56565'  // red
    },
    {
      title: 'In Progress',
      count: tasks.filter(t => t.status === 'in-progress').length,
      color: '#4299e1'  // blue
    },
    {
      title: 'Completed',
      count: tasks.filter(t => t.status === 'completed').length,
      color: '#48bb78'  // green
    },
  ]

  return (
    <div className="flex gap-4 mb-6 px-6">
      {stats.map((s, i) => {
        const pct = Math.round((s.count / total) * 100)
        const data = [
          { name: s.title, value: pct },
          { name: 'rest',        value: 100 - pct }
        ]
        return (
          <div
            key={i}
            className="flex-1 bg-white p-4 rounded-lg shadow"
          >
            <h5 className="mb-2 font-semibold">{s.title}</h5>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx === 0 ? s.color : '#edf2f7'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `${val}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center font-medium">{s.count} of {tasks.length}</p>
          </div>
        )
      })}
    </div>
  )
}
