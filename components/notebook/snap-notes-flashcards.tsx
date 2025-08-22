"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { notebooksAPI, type Snapnotes } from "@/lib/api/notebooks"
import { useNotebook } from "@/lib/hooks/use-notebooks"

interface SnapNotesFlashcardsProps {
  notebookId: string
  hasUploadedFiles: boolean
}

export function SnapNotesFlashcards({ notebookId, hasUploadedFiles }: SnapNotesFlashcardsProps) {
  const { notebook } = useNotebook(notebookId)
  const [snapnotes, setSnapnotes] = useState<Snapnotes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Flatten all flashcards from all chapters
  const allFlashcards =
    snapnotes?.flashcards.flatMap((chapter) =>
      chapter.flashcards.map((card) => ({
        ...card,
        chapterTitle: chapter.chapterTitle,
      })),
    ) || []

  useEffect(() => {
    if (notebookId) {
      fetchSnapnotes()
    }
  }, [notebookId])

  const fetchSnapnotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notebooksAPI.getNotebookSnapnotes(notebookId)
      setSnapnotes(data)
      setCurrentCard(0)
      setIsFlipped(false)
    } catch (err) {
      console.error("Error fetching snapnotes:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load flashcards"

      if (
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("no snapnotes associated")
      ) {
        generateFlashcardsForNotebook()
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateFlashcardsForNotebook = () => {
    if (!notebook) {
      setError("Notebook information not available")
      return
    }

    console.log(`Generating flashcards for notebook: ${notebook.name}`)
    const { snapnotes: generatedSnapnotes } = notebooksAPI.generateContentForNotebook(
      notebook.name,
      notebook.type || "general",
    )

    setSnapnotes(generatedSnapnotes)
    setError(null)
    setCurrentCard(0)
    setIsFlipped(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-muted-foreground">Loading flashcards for {notebook?.name || "notebook"}...</p>
      </div>
    )
  }

  if (error && !snapnotes) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-orange-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange-500"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="9" x2="15" y1="9" y2="15" />
            <line x1="15" x2="9" y1="9" y2="15" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">No flashcards found</h3>
        <p className="text-muted-foreground mb-4">No flashcards exist for "{notebook?.name || "this notebook"}" yet.</p>
        <div className="flex gap-2">
          <Button onClick={generateFlashcardsForNotebook} className="bg-blue-500 hover:bg-blue-600">
            Generate Flashcards for {notebook?.name}
          </Button>
          <Button onClick={fetchSnapnotes} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!snapnotes || allFlashcards.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="9" x2="15" y1="9" y2="15" />
            <line x1="15" x2="9" y1="9" y2="15" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">Create flashcards for {notebook?.name}</h3>
        <p className="text-muted-foreground mb-4">Generate study flashcards based on your notebook content</p>
        <Button onClick={generateFlashcardsForNotebook} className="bg-blue-500 hover:bg-blue-600">
          Generate Flashcards for {notebook?.name}
        </Button>
      </div>
    )
  }

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % allFlashcards.length)
    setIsFlipped(false)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + allFlashcards.length) % allFlashcards.length)
    setIsFlipped(false)
  }

  const currentFlashcard = allFlashcards[currentCard]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Flashcards</h3>
          <p className="text-sm text-muted-foreground">Study cards for {notebook?.name}</p>
        </div>
        <Button onClick={fetchSnapnotes} variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Refresh Cards
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <Button variant="outline" size="icon" className="mr-4" onClick={prevCard}>
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>

        <div
          className="relative h-[200px] w-[400px] cursor-pointer rounded-lg border p-6 text-center shadow-sm transition-transform hover:shadow-md"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute left-2 top-2 text-xs text-muted-foreground">{currentFlashcard.chapterTitle}</div>
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-lg font-medium">
              {isFlipped ? currentFlashcard.definition : currentFlashcard["key term"]}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {currentCard + 1}/{allFlashcards.length}
            </p>
          </div>
        </div>

        <Button variant="outline" size="icon" className="ml-4" onClick={nextCard}>
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="9" x2="15" y1="9" y2="15" />
            <line x1="15" x2="9" y1="9" y2="15" />
          </svg>
          Flip Card
        </Button>
      </div>
    </div>
  )
}
