"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, RotateCcw, ArrowLeft } from "lucide-react"

interface Question {
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  answer: string
  explanation: string
}

interface Chapter {
  chapterTitle: string
  questions: Question[]
}

interface QuizInterfaceEnhancedProps {
  chapters: Chapter[]
  onExitQuiz: () => void
  quizTitle?: string
  timeLimit?: number // in minutes
}

interface UserAnswer {
  questionIndex: number
  chapterIndex: number
  selectedAnswer: string
  isCorrect: boolean
  question: Question
}

export function QuizInterfaceEnhanced({
  chapters,
  onExitQuiz,
  quizTitle = "Practice Quiz",
  timeLimit = 30,
}: QuizInterfaceEnhancedProps) {
  // Flatten all questions from all chapters
  const allQuestions = chapters.flatMap((chapter, chapterIndex) =>
    chapter.questions.map((question, questionIndex) => ({
      ...question,
      chapterIndex,
      questionIndex,
      chapterTitle: chapter.chapterTitle,
    })),
  )

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60) // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false)

  const currentQuestion = allQuestions[currentQuestionIndex]
  const totalQuestions = allQuestions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, quizCompleted, timeRemaining])

  // Auto-complete quiz when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && quizStarted) {
      setQuizCompleted(true)
    }
  }, [timeRemaining, quizStarted])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.answer

    const userAnswer: UserAnswer = {
      questionIndex: currentQuestion.questionIndex,
      chapterIndex: currentQuestion.chapterIndex,
      selectedAnswer: answer,
      isCorrect,
      question: currentQuestion,
    }

    setUserAnswers((prev) => [...prev, userAnswer])
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswer(null)
    setShowExplanation(false)
    setQuizCompleted(false)
    setTimeRemaining(timeLimit * 60)
    setQuizStarted(false)
  }

  const calculateResults = () => {
    const correctAnswers = userAnswers.filter((answer) => answer.isCorrect).length
    const totalAnswered = userAnswers.length
    const percentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

    return {
      correct: correctAnswers,
      incorrect: totalAnswered - correctAnswers,
      unanswered: totalQuestions - totalAnswered,
      percentage,
      totalAnswered,
    }
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{quizTitle}</CardTitle>
          <div className="space-y-2 text-muted-foreground">
            <p>
              {totalQuestions} questions from {chapters.length} chapters
            </p>
            <p>Time limit: {timeLimit} minutes</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <h3 className="font-semibold">Chapters covered:</h3>
            <div className="grid gap-2">
              {chapters.map((chapter, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">{chapter.chapterTitle}</span>
                  <Badge variant="secondary">{chapter.questions.length} questions</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleStartQuiz} size="lg" className="bg-blue-500 hover:bg-blue-600">
              Start Quiz
            </Button>
            <Button onClick={onExitQuiz} variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Quiz results screen
  if (quizCompleted) {
    const results = calculateResults()

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
          <div className="text-4xl font-bold text-blue-500 mt-4">{results.percentage}%</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.correct}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.incorrect}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{results.unanswered}</div>
              <div className="text-sm text-gray-700">Unanswered</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>

          {/* Review answers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Your Answers</h3>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {userAnswers.map((userAnswer, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {userAnswer.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">{userAnswer.question.question}</div>
                      <div className="text-sm text-muted-foreground">
                        Chapter: {chapters[userAnswer.chapterIndex].chapterTitle}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Your answer: </span>
                          <span className={userAnswer.isCorrect ? "text-green-600" : "text-red-600"}>
                            {userAnswer.selectedAnswer}:{" "}
                            {
                              userAnswer.question.options[
                                userAnswer.selectedAnswer as keyof typeof userAnswer.question.options
                              ]
                            }
                          </span>
                        </div>
                        {!userAnswer.isCorrect && (
                          <div className="text-sm">
                            <span className="font-medium">Correct answer: </span>
                            <span className="text-green-600">
                              {userAnswer.question.answer}:{" "}
                              {
                                userAnswer.question.options[
                                  userAnswer.question.answer as keyof typeof userAnswer.question.options
                                ]
                              }
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Explanation: </span>
                          {userAnswer.question.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestartQuiz} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
            <Button onClick={onExitQuiz} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Notebook
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Quiz question screen
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </CardTitle>
            <div className="text-sm text-muted-foreground">Chapter: {currentQuestion.chapterTitle}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timeRemaining < 300 ? "text-red-500 font-bold" : ""}>{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{currentQuestion.question}</div>

        <div className="grid gap-3">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <Button
              key={key}
              variant={
                selectedAnswer === key
                  ? key === currentQuestion.answer
                    ? "default"
                    : "destructive"
                  : showExplanation && key === currentQuestion.answer
                    ? "default"
                    : "outline"
              }
              className={`justify-start text-left h-auto p-4 ${
                selectedAnswer === key
                  ? key === currentQuestion.answer
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                  : showExplanation && key === currentQuestion.answer
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
              }`}
              onClick={() => handleAnswerSelect(key)}
              disabled={showExplanation}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold">{key}.</span>
                <span>{value}</span>
              </div>
            </Button>
          ))}
        </div>

        {showExplanation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              {selectedAnswer === currentQuestion.answer ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-2">
                <div className="font-medium">
                  {selectedAnswer === currentQuestion.answer ? "Correct!" : "Incorrect"}
                </div>
                <div className="text-sm text-muted-foreground">{currentQuestion.explanation}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={onExitQuiz} variant="outline">
            Exit Quiz
          </Button>

          {showExplanation && (
            <Button onClick={handleNextQuestion} className="bg-blue-500 hover:bg-blue-600">
              {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
