// src/lib/tasks.ts
import fs from 'fs/promises'
import path from 'path'

/** A single to‑do item */
export interface Task {
  id: string
  title: string
  note: string
  dueDateTime: string      // ISO string from datetime-local
  priority: 'Low' | 'Medium' | 'High'
  status: 'not-started' | 'in-progress' | 'completed'
  image?: string           // base64 data URL
}

/** One chat “thread” (history) */
export interface Thread {
  id: string
  title: string
  createdAt: string        // ISO timestamp
  // you can expand this to include messages, etc.
}

/** The shape of your on‑disk store */
export interface Store {
  tasks: Task[]
  threads: Thread[]
}

const FILE = path.join(process.cwd(), 'data', 'tasks.json')

/**
 * Read the entire store from disk.
 * If the file does not exist, initialize it.
 */
export async function loadAll(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as Store
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // first run: create directory + empty store
      await fs.mkdir(path.dirname(FILE), { recursive: true })
      const init: Store = { tasks: [], threads: [] }
      await fs.writeFile(FILE, JSON.stringify(init, null, 2), 'utf-8')
      return init
    }
    throw err
  }
}

/** Overwrite the entire store on disk */
export async function saveAll(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf-8')
}

/** Convenience: load just the tasks array */
export async function loadTasks(): Promise<Task[]> {
  const { tasks } = await loadAll()
  return tasks
}

/** Convenience: persist just the tasks array */
export async function saveTasks(tasks: Task[]): Promise<void> {
  const store = await loadAll()
  store.tasks = tasks
  await saveAll(store)
}

/** Convenience: load just the threads array */
export async function loadThreads(): Promise<Thread[]> {
  const { threads } = await loadAll()
  return threads
}

/** Convenience: persist just the threads array */
export async function saveThreads(threads: Thread[]): Promise<void> {
  const store = await loadAll()
  store.threads = threads
  await saveAll(store)
}
