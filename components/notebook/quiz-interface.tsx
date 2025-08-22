"use client"

import { useState } from "react"

interface QuizInterfaceProps {
  questions?: Array<{
    question: string
    options: {
      A: string
      B: string
      C: string
      D: string
    }
    answer: string
    explanation: string
  }>
  onExitQuiz: () => void
}

export function QuizInterface({ questions = [], onExitQuiz }: QuizInterfaceProps) {
  // Use the passed questions or fallback to mock data
  const quizQuestions =
    questions.length > 0
      ? questions
      : [
          {
            question: "What is the basic unit of life?",
            options: {
              A: "Atom",
              B: "Cell",
              C: "Molecule",
              D: "Tissue",
            },
            answer: "B",
            explanation:
              "The cell is considered the basic unit of life as it is the smallest unit that can carry out all life processes.",
          },
          {
            question: "Which gas do plants use for photosynthesis?",
            options: {
              A: "Oxygen",
              B: "Carbon Dioxide",
              C: "Nitrogen",
              D: "Hydrogen",
            },
            answer: "B",
            explanation: "Plants use carbon dioxide during photosynthesis to produce glucose and oxygen.",
          },
          {
            question: "What is the largest organ in the human body?",
            options: {
              A: "Heart",
              B: "Liver",
              C: "Skin",
              D: "Brain",
            },
            answer: "C",
            explanation:
              "The skin is the largest organ in the human body, providing a protective barrier against the external environment.",
          },
        ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = quizQuestions[currentQuestionIndex]

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer)
    if (answer === currentQuestion.answer) {
      setScore(score + 1)
    }
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Quiz is finished
      alert(`Quiz finished! Your score is ${score} out of ${quizQuestions.length}`)
      onExitQuiz()
    }
  }

  return (
    <div className="quiz-container">
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{currentQuestion.question}</p>
      <div className="options">
        {Object.entries(currentQuestion.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleAnswerClick(key)}
            disabled={selectedAnswer !== null}
            className={selectedAnswer === key ? (key === currentQuestion.answer ? "correct" : "incorrect") : ""}
          >
            {key}: {value}
          </button>
        ))}
      </div>
      {showExplanation && (
        <div className="explanation">
          {selectedAnswer === currentQuestion.answer ? (
            <p className="correct-answer">Correct!</p>
          ) : (
            <p className="incorrect-answer">Incorrect. The correct answer was {currentQuestion.answer}.</p>
          )}
          <p>{currentQuestion.explanation}</p>
          <button onClick={handleNextQuestion}>
            {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
      )}
      {!showExplanation && selectedAnswer && selectedAnswer !== currentQuestion.answer && (
        <div className="explanation">
          <p className="incorrect-answer">Incorrect. The correct answer was {currentQuestion.answer}.</p>
          <button onClick={() => setShowExplanation(true)}>See Explanation</button>
        </div>
      )}
      <p>Score: {score}</p>
    </div>
  )
}
