"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotebooks } from "@/lib/hooks/use-notebooks"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const NOTEBOOK_ICONS = ["📘", "📐", "🧪", "🌍", "🧠", "📊", "🔬", "💻", "🎨", "🎵", "📝", "🧮"]
const NOTEBOOK_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Red", value: "#EF4444" },
  { name: "Yellow", value: "#F59E0B" },
]

interface CreateNotebookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNotebookDialog({ open, onOpenChange }: CreateNotebookDialogProps) {
  const router = useRouter()
  const { createNotebook } = useNotebooks()
  const [isLoading, setIsLoading] = useState(false)
  const [notebookName, setNotebookName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState(NOTEBOOK_ICONS[0])
  const [selectedColor, setSelectedColor] = useState(NOTEBOOK_COLORS[0].value)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const newNotebook = await createNotebook({
        name: notebookName,
        icon: selectedIcon,
        color: selectedColor,
        type: "study",
      })

      onOpenChange(false)
      setNotebookName("")
      setSelectedIcon(NOTEBOOK_ICONS[0])
      setSelectedColor(NOTEBOOK_COLORS[0].value)

      // Navigate to the new notebook using the actual ID from the response
      if (newNotebook && newNotebook.id) {
        router.push(`/dashboard/${newNotebook.id}`)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notebook")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNotebookName("")
    setSelectedIcon(NOTEBOOK_ICONS[0])
    setSelectedColor(NOTEBOOK_COLORS[0].value)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>Create a new notebook to organize your study materials.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notebook-name" className="text-base">
                Notebook Name
              </Label>
              <Input
                id="notebook-name"
                placeholder="e.g., Biology 101"
                value={notebookName}
                onChange={(e) => setNotebookName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-base">Choose an Icon</Label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                {NOTEBOOK_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={selectedIcon === icon ? "default" : "outline"}
                    className={`h-12 w-12 text-xl ${selectedIcon === icon ? "bg-blue-500 text-white dark:bg-blue-600" : ""}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-base">Choose a Color</Label>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                {NOTEBOOK_COLORS.map((color) => (
                  <div
                    key={color.value}
                    className={`flex flex-col items-center gap-2 cursor-pointer p-2 rounded-md ${selectedColor === color.value ? "bg-accent" : ""}`}
                    onClick={() => setSelectedColor(color.value)}
                  >
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: color.value }} />
                    <span className="text-xs font-medium">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              disabled={isLoading || !notebookName.trim()}
            >
              {isLoading ? "Creating..." : "Create Notebook"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
