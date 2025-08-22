"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuizPerformanceDetailProps {
  onClose: () => void
}

export function QuizPerformanceDetail({ onClose }: QuizPerformanceDetailProps) {
  const chapterPerformance = [
    { chapter: "Chapter 1: Introduction", score: 92, quizzes: 3, trend: "up" },
    { chapter: "Chapter 2: Cell Structure", score: 88, quizzes: 4, trend: "up" },
    { chapter: "Chapter 3: Genetics", score: 75, quizzes: 3, trend: "down" },
    { chapter: "Chapter 4: Botany", score: 95, quizzes: 2, trend: "up" },
    { chapter: "Chapter 5: Ecology", score: 82, quizzes: 3, trend: "stable" },
  ]

  const recentQuizzes = [
    { name: "Cell Structure Quiz 4", score: 95, date: "2 days ago", chapter: "Chapter 2" },
    { name: "Genetics Quiz 3", score: 78, date: "4 days ago", chapter: "Chapter 3" },
    { name: "Botany Quiz 2", score: 92, date: "1 week ago", chapter: "Chapter 4" },
    { name: "Cell Structure Quiz 3", score: 88, date: "1 week ago", chapter: "Chapter 2" },
  ]

  const averageScore = Math.round(
    chapterPerformance.reduce((sum, item) => sum + item.score, 0) / chapterPerformance.length,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quiz Performance Analysis</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-500">{averageScore}%</div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">15</div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">+5%</div>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Performance by Chapter</h3>
            <div className="space-y-4">
              {chapterPerformance.map((item, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.chapter}</h4>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-500">{item.score}%</span>
                      {item.trend === "up" && (
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
                          className="text-green-500"
                        >
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                      )}
                      {item.trend === "down" && (
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
                          className="text-red-500"
                        >
                          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                          <polyline points="16 17 22 17 22 11" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <Progress value={item.score} className="h-2 mb-2" />
                  <div className="text-xs text-muted-foreground">{item.quizzes} quizzes completed</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Recent Quiz Results</h3>
            <div className="space-y-2">
              {recentQuizzes.map((quiz, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <h4 className="font-medium">{quiz.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quiz.chapter} • {quiz.date}
                    </p>
                  </div>
                  <div
                    className={`font-bold ${quiz.score >= 90 ? "text-green-500" : quiz.score >= 80 ? "text-blue-500" : "text-orange-500"}`}
                  >
                    {quiz.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Recommendations</h3>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="font-medium text-yellow-800">Focus Area: Chapter 3 (Genetics)</p>
                <p className="text-yellow-700">
                  Your score dropped to 75%. Consider reviewing key concepts and taking practice quizzes.
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="font-medium text-green-800">Strength: Chapter 4 (Botany)</p>
                <p className="text-green-700">Excellent performance with 95% average. Keep up the great work!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
