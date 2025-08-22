"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { notebooksAPI, type Snapnotes } from "@/lib/api/notebooks"
import { useNotebook } from "@/lib/hooks/use-notebooks"
import {
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from "lucide-react"

interface SnapNotesProps {
  notebookId: string
}

export function SnapNotes({ notebookId }: SnapNotesProps) {
  const { notebook } = useNotebook(notebookId)
  const [snapnotes, setSnapnotes] = useState<Snapnotes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false)
  const [selectedChapterForFlashcards, setSelectedChapterForFlashcards] = useState<string | null>(null)

  // Update the card styling in the component
  const cardStyles = "bg-card border shadow-sm dark:border-gray-800"
  const cardHeaderStyles = "bg-card dark:bg-gray-900"
  const cardContentStyles = "bg-card dark:bg-gray-900"

  // Update the chapter toggle styling
  const chapterToggleStyles = "cursor-pointer hover:bg-accent/50 transition-colors dark:hover:bg-gray-800"

  // Keep summary section with blue colors (not dynamic)
  const summaryBgStyles = "bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4"
  const summaryTextStyles = "text-gray-700 dark:text-gray-300 leading-relaxed"

  // Keep key points with amber colors (not dynamic)
  const keyPointStyles =
    "flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-200 dark:border-amber-700"
  const keyPointTextStyles = "text-gray-700 dark:text-gray-300 text-sm leading-relaxed"

  // Only make flashcard borders dynamic (these were originally blue)
  const flashcardFrontStyles =
    "absolute inset-0 backface-hidden border-2 border-primary/50 dark:border-primary/60 hover:border-primary dark:hover:border-primary transition-colors bg-card"
  const flashcardBackStyles =
    "absolute inset-0 backface-hidden rotate-y-180 border-2 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-colors bg-card"

  // Update the empty state styling
  const emptyStateStyles = "flex items-center justify-center h-full text-gray-500 dark:text-gray-400"

  // Safely get all flashcards from all chapters with null checks
  const allFlashcards = snapnotes?.flashcards
    ? snapnotes.flashcards.flatMap((chapter) =>
        chapter.flashcards.map((card) => ({
          ...card,
          chapterTitle: chapter.chapterTitle,
        })),
      )
    : []

  // Get flashcards for selected chapter with null checks
  const chapterFlashcards =
    selectedChapterForFlashcards && snapnotes?.flashcards
      ? snapnotes.flashcards.find((ch) => ch.chapterTitle === selectedChapterForFlashcards)?.flashcards || []
      : []

  const currentFlashcards = selectedChapterForFlashcards ? chapterFlashcards : allFlashcards
  const currentCard = currentFlashcards.length > 0 ? currentFlashcards[currentFlashcardIndex] : null

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

      const data = await notebooksAPI.getNotebookSnapnotes(notebookId)
      setSnapnotes(data)

      // Auto-expand first chapter
      if (data?.summaryByChapter && data.summaryByChapter.length > 0) {
        setExpandedChapters([data.summaryByChapter[0].chapterTitle])
      }
    } catch (err) {
      console.error("Error fetching snapnotes:", err)
      setError(err instanceof Error ? err.message : "Failed to load snapnotes")
    } finally {
      setLoading(false)
    }
  }

  const toggleChapter = (chapterTitle: string) => {
    if (expandedChapters.includes(chapterTitle)) {
      setExpandedChapters(expandedChapters.filter((title) => title !== chapterTitle))
    } else {
      setExpandedChapters([...expandedChapters, chapterTitle])
    }
  }

  const nextFlashcard = () => {
    if (currentFlashcards.length === 0) return
    setCurrentFlashcardIndex((prev) => (prev + 1) % currentFlashcards.length)
    setIsFlashcardFlipped(false)
  }

  const prevFlashcard = () => {
    if (currentFlashcards.length === 0) return
    setCurrentFlashcardIndex((prev) => (prev - 1 + currentFlashcards.length) % currentFlashcards.length)
    setIsFlashcardFlipped(false)
  }

  const resetFlashcards = () => {
    setCurrentFlashcardIndex(0)
    setIsFlashcardFlipped(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Loading your study materials...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium">Failed to load notes</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchSnapnotes} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!snapnotes || !snapnotes.summaryByChapter || snapnotes.summaryByChapter.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-amber-100 p-4">
          <FileText className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No study materials found</h3>
        <p className="text-muted-foreground mb-4">
          This notebook doesn't have any study materials yet. Try generating some from your notes.
        </p>
        <Button onClick={fetchSnapnotes} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{snapnotes.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {snapnotes.summaryByChapter.length} chapters • {allFlashcards.length} flashcards
          </p>
        </div>
        <Button onClick={fetchSnapnotes} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="summaries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summaries" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Summaries & Key Points
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Flashcards
          </TabsTrigger>
        </TabsList>

        {/* Summaries Tab */}
        <TabsContent value="summaries" className="mt-6 space-y-4">
          {snapnotes.summaryByChapter.map((chapter, index) => (
            <Card key={chapter.chapterTitle} className={`overflow-hidden ${cardStyles}`}>
              <CardHeader className={`${chapterToggleStyles}`} onClick={() => toggleChapter(chapter.chapterTitle)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">{chapter.chapterTitle}</CardTitle>
                  </div>
                  {expandedChapters.includes(chapter.chapterTitle) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>

              {expandedChapters.includes(chapter.chapterTitle) && (
                <CardContent className={`pt-0 space-y-6 ${cardContentStyles}`}>
                  {/* Summary Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Summary</h4>
                    </div>
                    <div className={`${summaryBgStyles}`}>
                      <p className={`${summaryTextStyles}`}>{chapter.summary}</p>
                    </div>
                  </div>

                  {/* Key Points Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Key Points</h4>
                      <Badge variant="secondary" className="ml-2">
                        {chapter.keyPoints.length}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {chapter.keyPoints.map((point, pointIndex) => (
                        <div key={pointIndex} className={`${keyPointStyles}`}>
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium mt-0.5">
                            {pointIndex + 1}
                          </div>
                          <p className={`${keyPointTextStyles}`}>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="mt-6 space-y-6">
          {/* Chapter Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedChapterForFlashcards === null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedChapterForFlashcards(null)
                setCurrentFlashcardIndex(0)
                setIsFlashcardFlipped(false)
              }}
            >
              All Chapters ({allFlashcards.length})
            </Button>
            {snapnotes.flashcards &&
              snapnotes.flashcards.map((chapter) => (
                <Button
                  key={chapter.chapterTitle}
                  variant={selectedChapterForFlashcards === chapter.chapterTitle ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedChapterForFlashcards(chapter.chapterTitle)
                    setCurrentFlashcardIndex(0)
                    setIsFlashcardFlipped(false)
                  }}
                >
                  {chapter.chapterTitle} ({chapter.flashcards.length})
                </Button>
              ))}
          </div>

          {currentFlashcards.length > 0 ? (
            <div className="space-y-6">
              {/* Flashcard Counter */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Card {currentFlashcardIndex + 1} of {currentFlashcards.length}
                  {selectedChapterForFlashcards && (
                    <span className="ml-2 text-primary">• {selectedChapterForFlashcards}</span>
                  )}
                </p>
              </div>

              {/* Flashcard */}
              <div className="flex justify-center">
                <div
                  className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
                  onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlashcardFlipped ? "rotate-y-180" : ""}`}
                  >
                    {/* Front of card */}
                    <Card className={`${flashcardFrontStyles}`}>
                      <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="mb-4">
                          <Badge variant="outline" className="text-xs">
                            {!selectedChapterForFlashcards && currentCard?.chapterTitle}
                            {selectedChapterForFlashcards && "Term"}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          {currentCard?.["key term"]}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to reveal definition</p>
                      </CardContent>
                    </Card>

                    {/* Back of card */}
                    <Card className={`${flashcardBackStyles}`}>
                      <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="mb-4">
                          <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/50">
                            Definition
                          </Badge>
                        </div>
                        <p className="text-lg text-gray-900 dark:text-white leading-relaxed">
                          {currentCard?.definition}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Click to see term</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" onClick={prevFlashcard} disabled={currentFlashcards.length <= 1}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Flip Card
                </Button>

                <Button variant="outline" size="sm" onClick={resetFlashcards}>
                  Reset
                </Button>

                <Button variant="outline" size="sm" onClick={nextFlashcard} disabled={currentFlashcards.length <= 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentFlashcardIndex + 1) / currentFlashcards.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${emptyStateStyles}`}>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No flashcards available</h3>
              <p className="text-gray-600 dark:text-gray-400">No flashcards found for the selected chapter.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Add custom CSS for 3D flip effect
const style = document.createElement("style")
style.textContent = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`
document.head.appendChild(style)
