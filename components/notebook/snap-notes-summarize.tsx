"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { notebooksAPI, type Snapnotes } from "@/lib/api/notebooks"
import { useNotebook } from "@/lib/hooks/use-notebooks"

interface SnapNotesSummarizeProps {
  notebookId: string
  hasUploadedFiles: boolean
}

export function SnapNotesSummarize({ notebookId, hasUploadedFiles }: SnapNotesSummarizeProps) {
  const { notebook } = useNotebook(notebookId)
  const [snapnotes, setSnapnotes] = useState<Snapnotes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (notebookId) {
      fetchSnapnotes()
    }
  }, [notebookId])

  const fetchSnapnotes = async () => {
    if (!notebookId) {
      setError("No notebook ID provided")
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log(`Fetching snapnotes for notebook: ${notebookId}`)

      const data = await notebooksAPI.getNotebookSnapnotes(notebookId)
      setSnapnotes(data)

      // Auto-expand first chapter
      if (data.summaryByChapter && data.summaryByChapter.length > 0) {
        setExpandedChapters([data.summaryByChapter[0].chapterTitle])
      }
    } catch (err) {
      console.error("Error fetching snapnotes:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load snapnotes"

      // If no snapnotes found, generate based on notebook content
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("no snapnotes associated")
      ) {
        // generateSnapnotesForNotebook() // Removed this line
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateSnapnotesForNotebook = () => {
    if (!notebook) {
      setError("Notebook information not available")
      return
    }

    console.log(`Generating snapnotes for notebook: ${notebook.name}`)
    const { snapnotes: generatedSnapnotes } = notebooksAPI.generateContentForNotebook(
      notebook.name,
      notebook.type || "general",
    )

    // Update the title to match the notebook
    generatedSnapnotes.title = `${notebook.name} - Study Summaries`

    setSnapnotes(generatedSnapnotes)
    setError(null)

    // Auto-expand first chapter
    if (generatedSnapnotes.summaryByChapter.length > 0) {
      setExpandedChapters([generatedSnapnotes.summaryByChapter[0].chapterTitle])
    }
  }

  const toggleChapter = (chapterTitle: string) => {
    if (expandedChapters.includes(chapterTitle)) {
      setExpandedChapters(expandedChapters.filter((title) => title !== chapterTitle))
    } else {
      setExpandedChapters([...expandedChapters, chapterTitle])
    }
  }

  const generateNotes = async () => {
    if (!notebook?.google_drive_link) {
      setError("No document uploaded yet")
      return
    }

    try {
      setGenerating(true)
      setError(null)

      console.log("Starting snapnotes generation...")

      // Use the new API method
      const result = await notebooksAPI.generateSnapnotes({
        notebook_id: notebookId,
        google_drive_link: notebook.google_drive_link,
      })

      console.log("Snapnotes generation initiated:", result)

      // Start polling for completion after a short delay
      setTimeout(() => {
        fetchSnapnotes()
      }, 2000)
    } catch (error) {
      console.error("Generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate notes")
    } finally {
      setGenerating(false)
    }
  }

  if (loading || generating) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-muted-foreground">
          {generating
            ? `Generating summaries for ${notebook?.name || "notebook"}...`
            : `Loading summaries for ${notebook?.name || "notebook"}...`}
        </p>
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">No summaries found</h3>
        <p className="text-muted-foreground mb-4">No summaries exist for "{notebook?.name || "this notebook"}" yet.</p>
        <div className="flex gap-2">
          {notebook?.google_drive_link ? (
            <Button onClick={generateNotes} className="bg-blue-500 hover:bg-blue-600">
              Generate Summaries for {notebook?.name}
            </Button>
          ) : (
            <></>
          )}
          <Button onClick={fetchSnapnotes} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!snapnotes || !snapnotes.summaryByChapter || snapnotes.summaryByChapter.length === 0) {
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
            <path d="M10 9H8" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">Create summaries for {notebook?.name}</h3>
        <p className="text-muted-foreground mb-4">Generate study summaries based on your notebook content</p>
        {notebook?.google_drive_link ? (
          <Button onClick={generateNotes} className="bg-blue-500 hover:bg-blue-600">
            Generate Summaries for {notebook?.name}
          </Button>
        ) : (
          <></>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{snapnotes.title}</h3>
          <p className="text-sm text-muted-foreground">Study summaries for {notebook?.name}</p>
        </div>
        <div className="flex gap-2">
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
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Refresh
          </Button>
          <Button onClick={generateSnapnotesForNotebook} variant="outline" size="sm">
            Regenerate
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {snapnotes.summaryByChapter.map((chapter) => (
          <div key={chapter.chapterTitle} className="rounded-lg border">
            <button
              className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              onClick={() => toggleChapter(chapter.chapterTitle)}
            >
              <div className="flex items-center">
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
                  className="mr-2 text-orange-500"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="font-medium">{chapter.chapterTitle}</span>
              </div>
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
                className={`transition-transform ${expandedChapters.includes(chapter.chapterTitle) ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {expandedChapters.includes(chapter.chapterTitle) && (
              <div className="border-t p-4 bg-gray-50">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Summary:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{chapter.summary}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                  <ul className="ml-6 list-disc text-sm text-gray-700 space-y-1">
                    {chapter.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
