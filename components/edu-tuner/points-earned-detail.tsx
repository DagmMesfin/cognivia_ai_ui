"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PointsEarnedDetailProps {
  onClose: () => void
}

export function PointsEarnedDetail({ onClose }: PointsEarnedDetailProps) {
  const pointsBreakdown = [
    { chapter: "Chapter 1: Introduction", points: 450, quizzes: 3 },
    { chapter: "Chapter 2: Cell Structure", points: 680, quizzes: 4 },
    { chapter: "Chapter 3: Genetics", points: 520, quizzes: 3 },
    { chapter: "Chapter 4: Botany", points: 380, quizzes: 2 },
    { chapter: "Chapter 5: Ecology", points: 530, quizzes: 3 },
  ]

  const totalPoints = pointsBreakdown.reduce((sum, item) => sum + item.points, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Points Earned Breakdown</CardTitle>
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
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">{totalPoints.toLocaleString()}</div>
            <p className="text-muted-foreground">Total Points Earned</p>
            <div className="mt-2 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800 inline-block">
              Top 10% of Students
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Points by Chapter</h3>
            <div className="space-y-4">
              {pointsBreakdown.map((item, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.chapter}</h4>
                    <div className="text-right">
                      <div className="font-bold text-blue-500">{item.points} pts</div>
                      <div className="text-xs text-muted-foreground">{item.quizzes} quizzes</div>
                    </div>
                  </div>
                  <Progress value={(item.points / 700) * 100} className="h-2" />
                  <div className="mt-2 text-xs text-muted-foreground">
                    Average: {Math.round(item.points / item.quizzes)} points per quiz
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Point Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-500">1,890</div>
                <p className="text-sm text-muted-foreground">Quiz Completion</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-500">420</div>
                <p className="text-sm text-muted-foreground">Perfect Scores</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-500">250</div>
                <p className="text-sm text-muted-foreground">Study Streaks</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-500">0</div>
                <p className="text-sm text-muted-foreground">Bonus Points</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Next Milestone</h3>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Gold Badge</span>
                <span className="text-sm text-muted-foreground">3,000 points</span>
              </div>
              <Progress value={(totalPoints / 3000) * 100} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{3000 - totalPoints} points to go</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
