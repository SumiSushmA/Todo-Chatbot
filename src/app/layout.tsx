import { ReactNode } from 'react'
import './globals.css'

export const metadata = { title: 'To Do List', description: '' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
