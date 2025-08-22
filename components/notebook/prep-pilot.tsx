"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { QuizInterfaceEnhanced } from "@/components/notebook/quiz-interface-enhanced"
import { notebooksAPI, type PrepPilot as PrepPilotData } from "@/lib/api/notebooks"
import { useNotebook } from "@/lib/hooks/use-notebooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Clock, Target, Zap } from "lucide-react"

interface PrepPilotProps {
  notebookId: string
}

// Update the card styling
const cardStyles = "bg-card dark:border-gray-800"

// Update the loading state styling
const loadingStateStyles = "flex min-h-[300px] flex-col items-center justify-center"

// Update the error state styling
const errorStateStyles = "flex min-h-[300px] flex-col items-center justify-center text-center"
const errorIconBgStyles = "mb-4 rounded-full bg-orange-100 dark:bg-orange-900/50 p-4"
const errorIconStyles = "h-8 w-8 text-orange-500 dark:text-orange-400"

// Update the empty state styling
const emptyStateStyles = "flex min-h-[300px] flex-col items-center justify-center text-center"
const emptyIconBgStyles = "mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4"
const emptyIconStyles = "h-8 w-8 text-gray-400 dark:text-gray-500"

// Update the chapter selection styling
const chapterSelectionStyles = "flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-card"

export function PrepPilot({ notebookId }: PrepPilotProps) {
  const { notebook } = useNotebook(notebookId)
  const [prepPilotData, setPrepPilotData] = useState<PrepPilotData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState("easy")
  const [isQuizActive, setIsQuizActive] = useState(false)

  useEffect(() => {
    if (notebookId) {
      fetchPrepPilot()
    }
  }, [notebookId])

  const fetchPrepPilot = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notebooksAPI.getNotebookPrepPilot(notebookId)
      setPrepPilotData(data)
      // Auto-select first chapter if available
      if (data.chapters.length > 0) {
        setSelectedChapters([data.chapters[0].chapterTitle])
      }
    } catch (err) {
      console.error("Error fetching prep pilot:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load prep pilot"

      if (
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("no prep pilot associated")
      ) {
        // Don't auto-generate, let user choose to create
        setError("No quiz questions found for this notebook.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateQuizForNotebook = async () => {
    if (!notebook) {
      setError("Notebook information not available")
      return
    }

    try {
      setGenerating(true)
      setError(null)

      console.log(`Generating quiz for notebook: ${notebook.name}`)

      // Call the quiz generation webhook
      const generateResponse = await notebooksAPI.generateQuiz({
        notebook_id: notebookId,
        notebook_name: notebook.name,
        google_drive_link: notebook.google_drive_link,
      })

      console.log("Quiz generation response:", generateResponse)

      // Update the notebook with the new prep_pilot_id if provided
      if (generateResponse.id) {
        await notebooksAPI.updateNotebookPrepPilotId(notebookId, generateResponse.id)
      }

      // Wait a moment for the quiz to be processed, then fetch the data
      setTimeout(async () => {
        try {
          await fetchPrepPilot()
        } catch (fetchError) {
          console.error("Error fetching generated quiz:", fetchError)
          // If fetching fails, generate fallback content
          const { prepPilot: generatedPrepPilot } = notebooksAPI.generateContentForNotebook(
            notebook.name,
            notebook.type || "general",
          )
          setPrepPilotData(generatedPrepPilot)

          // Auto-select first chapter
          if (generatedPrepPilot.chapters.length > 0) {
            setSelectedChapters([generatedPrepPilot.chapters[0].chapterTitle])
          }
        }
      }, 2000)
    } catch (err) {
      console.error("Error generating quiz:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate quiz"
      setError(errorMessage)

      // Fallback to local generation
      console.log("Falling back to local quiz generation")
      const { prepPilot: generatedPrepPilot } = notebooksAPI.generateContentForNotebook(
        notebook.name,
        notebook.type || "general",
      )
      setPrepPilotData(generatedPrepPilot)
      setError(null)

      // Auto-select first chapter
      if (generatedPrepPilot.chapters.length > 0) {
        setSelectedChapters([generatedPrepPilot.chapters[0].chapterTitle])
      }
    } finally {
      setGenerating(false)
    }
  }

  const toggleChapter = (chapterTitle: string) => {
    if (selectedChapters.includes(chapterTitle)) {
      setSelectedChapters(selectedChapters.filter((title) => title !== chapterTitle))
    } else {
      setSelectedChapters([...selectedChapters, chapterTitle])
    }
  }

  const startQuiz = () => {
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter")
      return
    }
    setIsQuizActive(true)
  }

  if (isQuizActive && prepPilotData) {
    // Filter questions based on selected chapters
    const selectedChaptersData = prepPilotData.chapters
      .filter((chapter) => selectedChapters.includes(chapter.chapterTitle))
      .map((chapter) => ({
        ...chapter,
        questions: chapter.questions.slice(0, questionCount),
      }))

    return (
      <QuizInterfaceEnhanced
        chapters={selectedChaptersData}
        onExitQuiz={() => setIsQuizActive(false)}
        quizTitle={`${notebook?.name} Practice Quiz`}
        timeLimit={Math.max(10, questionCount * 2)} // 2 minutes per question, minimum 10 minutes
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center">
          <h3 className="flex items-center text-lg font-medium">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            PrepPilot
          </h3>
        </div>
        <Card className={cardStyles}>
          <CardContent className={loadingStateStyles}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading quiz questions for {notebook?.name || "notebook"}...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !prepPilotData) {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center">
          <h3 className="flex items-center text-lg font-medium">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            PrepPilot
          </h3>
        </div>
        <Card className={cardStyles}>
          <CardContent className={errorStateStyles}>
            <div className={errorIconBgStyles}>
              <Target className={errorIconStyles} />
            </div>
            <h3 className="mb-2 text-lg font-medium">No quiz questions found</h3>
            <p className="text-muted-foreground mb-4">
              No practice questions exist for "{notebook?.name || "this notebook"}" yet.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={generateQuizForNotebook}
                disabled={generating}
                className="bg-primary hover:bg-primary/90"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Quiz for {notebook?.name}
                  </>
                )}
              </Button>
              <Button onClick={fetchPrepPilot} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!prepPilotData || prepPilotData.chapters.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="mb-4 flex items-center">
          <h3 className="flex items-center text-lg font-medium">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            PrepPilot
          </h3>
        </div>
        <Card className={cardStyles}>
          <CardContent className={emptyStateStyles}>
            <div className={emptyIconBgStyles}>
              <Target className={emptyIconStyles} />
            </div>
            <h3 className="mb-2 text-lg font-medium">Create practice quiz for {notebook?.name}</h3>
            <p className="text-muted-foreground mb-4">Generate practice questions based on your notebook content</p>
            <Button onClick={generateQuizForNotebook} disabled={generating} className="bg-primary hover:bg-primary/90">
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Create Quiz for {notebook?.name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center text-lg font-medium">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            PrepPilot
          </h3>
          <p className="text-sm text-muted-foreground">Practice quiz for {notebook?.name}</p>
        </div>
        <Button onClick={generateQuizForNotebook} variant="outline" size="sm" disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            "Regenerate Quiz"
          )}
        </Button>
      </div>

      <Card className={cardStyles}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create a Practice Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="flex items-center text-sm font-medium">
              <BookOpen className="mr-2 h-4 w-4" />
              Choose Section(s)
            </h4>
            <div className="grid gap-3">
              {prepPilotData.chapters.map((chapter) => (
                <div key={chapter.chapterTitle} className={chapterSelectionStyles}>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={chapter.chapterTitle}
                      checked={selectedChapters.includes(chapter.chapterTitle)}
                      onCheckedChange={() => toggleChapter(chapter.chapterTitle)}
                    />
                    <Label htmlFor={chapter.chapterTitle} className="font-medium">
                      {chapter.chapterTitle}
                    </Label>
                  </div>
                  <Badge variant="secondary">{chapter.questions.length} questions</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center text-sm font-medium">
              <Clock className="mr-2 h-4 w-4" />
              Number of Questions
            </h4>
            <div className="px-2">
              <Slider
                value={[questionCount]}
                min={1}
                max={Math.min(
                  20,
                  prepPilotData.chapters
                    .filter((chapter) => selectedChapters.includes(chapter.chapterTitle))
                    .reduce((total, chapter) => total + chapter.questions.length, 0),
                )}
                step={1}
                onValueChange={(value) => setQuestionCount(value[0])}
                className="mb-2"
              />
              <div className="text-center font-medium">{questionCount}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center text-sm font-medium">
              <Target className="mr-2 h-4 w-4" />
              Difficulty
            </h4>
            <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard">Hard</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={startQuiz}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={selectedChapters.length === 0}
            size="lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start Quiz ({selectedChapters.length} chapters selected)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
