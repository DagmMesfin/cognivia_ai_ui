"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useNotebooks } from "@/lib/hooks/use-notebooks"

const NOTEBOOK_ICONS = ["📘", "📐", "🧪", "🌍", "🧠", "📊", "🔬", "💻", "🎨", "🎵", "📝", "🧮"]
const NOTEBOOK_COLORS = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Orange", value: "orange" },
  { name: "Purple", value: "purple" },
  { name: "Red", value: "red" },
  { name: "Yellow", value: "yellow" },
]

export function CreateNotebookForm() {
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
      await createNotebook({
        name: notebookName,
        icon: selectedIcon,
        color: selectedColor,
        type: "study",
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notebook")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <Label htmlFor="notebook-name" className="text-base">
              Notebook Name
            </Label>
            <Input
              id="notebook-name"
              placeholder="e.g., Biology 101"
              className="mt-2"
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <Label className="text-base">Choose an Icon</Label>
            <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-12">
              {NOTEBOOK_ICONS.map((icon) => (
                <Button
                  key={icon}
                  type="button"
                  variant={selectedIcon === icon ? "default" : "outline"}
                  className={`h-12 w-12 text-xl ${selectedIcon === icon ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-base">Choose a Color</Label>
            <RadioGroup
              value={selectedColor}
              onValueChange={setSelectedColor}
              className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6"
            >
              {NOTEBOOK_COLORS.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={color.value}
                    id={`color-${color.value}`}
                    className={`border-${color.value}-500`}
                  />
                  <Label htmlFor={`color-${color.value}`} className="flex items-center gap-2 font-normal">
                    <div className={`h-4 w-4 rounded-full bg-${color.value}-500`} />
                    {color.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isLoading || !notebookName.trim()}
            >
              {isLoading ? "Creating..." : "Create Notebook"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
