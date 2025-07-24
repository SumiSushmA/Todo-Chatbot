// src/lib/types.ts
export interface Task {
  _id: string
  title: string
  note: string
  dueDateTime: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'not-started' | 'in-progress' | 'completed'
  image?: string
}
