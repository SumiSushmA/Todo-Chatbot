/*
File: src/components/ChatSidebar.tsx
A sidebar list of saved chat threads with "New Chat" button.
*/

export type Thread = { id: string; title: string; messages: any[] }

type Props = {
  threads: Thread[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

export default function ChatSidebar({ threads, activeId, onSelect, onNew }: Props) {
  return (
    <div className="w-64 border-r overflow-y-auto bg-gray-50 p-4">
      <button
        className="mb-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        onClick={onNew}
      >
        + New Chat
      </button>
      <ul className="space-y-2">
        {threads.map(t => (
          <li key={t.id}>
            <button
              onClick={() => onSelect(t.id)}
              className={
                `w-full text-left px-3 py-2 rounded-lg hover:bg-gray-200 transition ` +
                (t.id === activeId ? 'bg-white font-medium' : '')
              }
            >
              {t.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}