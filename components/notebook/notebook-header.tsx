import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NotebookHeaderProps {
  notebook: {
    id: string
    title?: string
    name?: string
    icon?: string
    subject?: string
  }
}

export function NotebookHeader({ notebook }: NotebookHeaderProps) {
  // Fallback values in case notebook data is incomplete
  const displayName = notebook.name || notebook.title || "Untitled Notebook"
  const displayIcon = notebook.icon || "📚"

  console.log("NotebookHeader: Rendering with notebook:", notebook)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500 text-white text-lg">
          {displayIcon}
        </div>
        <h2 className="text-2xl font-bold">{displayName}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Button>
        <Button variant="outline" size="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
