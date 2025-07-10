import { promises as fs } from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'data', 'tasks.json')

export async function loadAll(): Promise<Record<string,any[]>> {
  const json = await fs.readFile(file,'utf-8')
  return JSON.parse(json)
}

export async function saveAll(all: Record<string,any[]>): Promise<void> {
  await fs.writeFile(file, JSON.stringify(all,null,2))
}
