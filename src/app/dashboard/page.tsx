// src/app/dashboard/page.tsx
'use client'

import { Task } from '@/lib/types'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts'

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then((ts: Task[]) => setTasks(ts))
      .catch(console.error)
  }, [])

  // 1) Priority counts
  const priCounts: Record<Task['priority'], number> = {
    Low: 0,
    Medium: 0,
    High: 0,
  }
  tasks.forEach(t => {
    priCounts[t.priority]++
  })
  const barData = [
    { name: 'Low',    count: priCounts.Low },
    { name: 'Medium', count: priCounts.Medium },
    { name: 'High',   count: priCounts.High },
  ]
  const pieData = [
    { name: 'Low',    value: priCounts.Low,    color: '#F59E0B' },
    { name: 'Medium', value: priCounts.Medium, color: '#3B82F6' },
    { name: 'High',   value: priCounts.High,   color: '#EF4444' },
  ]

  // 2) Last 7 days
  const today = new Date()
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const lineData = last7.map(day => {
    const onDay = tasks.filter(t => t.dueDateTime.startsWith(day))
    return {
      day: day.slice(5),
      NotStarted: onDay.filter(t => t.status === 'not-started').length,
      InProgress: onDay.filter(t => t.status === 'in-progress').length,
      Completed:  onDay.filter(t => t.status === 'completed').length,
    }
  })

  // 3) Status breakdown percent
  const total = tasks.length || 1
  const stCounts = {
    Completed:  tasks.filter(t => t.status === 'completed').length,
    InProgress: tasks.filter(t => t.status === 'in-progress').length,
    NotStarted: tasks.filter(t => t.status === 'not-started').length,
  }
  const percentData = [
    {
      label: 'Completed',
      percent: Math.round((stCounts.Completed  / total) * 100),
      color: '#10B981',
    },
    {
      label: 'In Progress',
      percent: Math.round((stCounts.InProgress / total) * 100),
      color: '#3B82F6',
    },
    {
      label: 'Not Started',
      percent: Math.round((stCounts.NotStarted / total) * 100),
      color: '#F87171',
    },
  ]

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Tasks by Priority */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Tasks by Priority</h2>
          <div className="w-full h-56">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top:20, right:20, left:-10, bottom:0 }}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis allowDecimals={false} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Bar dataKey="count" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Due Tasks Last 7 Days */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Due Tasks Last 7 Days</h2>
          <div className="w-full h-56">
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top:20, right:30, left:0, bottom:0 }}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis allowDecimals={false} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Line type="monotone" dataKey="NotStarted" stroke="#F87171" dot={false} name="Not Started" />
                <Line type="monotone" dataKey="InProgress" stroke="#3B82F6" dot={false} name="In Progress" />
                <Line type="monotone" dataKey="Completed"  stroke="#10B981" dot={false} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Priority Distribution */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Priority Distribution</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="50%"
                  outerRadius="80%"
                  labelLine={false}
                  label={({ cx=0, cy=0, midAngle=0, innerRadius=0, outerRadius=0, percent=0, name='' }) => {
                    const RAD = Math.PI / 180
                    const r = innerRadius + (outerRadius - innerRadius) * 1.3
                    const x = cx + r * Math.cos(-midAngle * RAD)
                    const y = cy + r * Math.sin(-midAngle * RAD)
                    return (
                      <text x={x} y={y} fill="#fff"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central" fontSize={12}>
                        {`${name}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    )
                  }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieData[i].color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Status Breakdown */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Status Breakdown</h2>
          <div className="space-y-4">
            {percentData.map(d => (
              <div key={d.label}>
                <div className="flex justify-between mb-1">
                  <span>{d.label}</span>
                  <span>{d.percent}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${d.percent}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
