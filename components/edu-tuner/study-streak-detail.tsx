"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StudyStreakDetailProps {
  onClose: () => void
}

export function StudyStreakDetail({ onClose }: StudyStreakDetailProps) {
  const streakData = [
    { day: "Mon", completed: true, hours: 2.5 },
    { day: "Tue", completed: true, hours: 3.0 },
    { day: "Wed", completed: true, hours: 1.5 },
    { day: "Thu", completed: true, hours: 2.0 },
    { day: "Fri", completed: true, hours: 2.5 },
    { day: "Sat", completed: false, hours: 0 },
    { day: "Sun", completed: true, hours: 1.0 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Study Streak Details</CardTitle>
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
            <div className="text-4xl font-bold text-orange-500">28</div>
            <p className="text-muted-foreground">Days Current Streak</p>
          </div>

          <div>
            <h3 className="mb-4 font-medium">This Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {streakData.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground">{day.day}</div>
                  <div
                    className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day.completed ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {day.completed ? "✓" : "×"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{day.hours}h</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Streak Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">45</div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">156</div>
                <p className="text-sm text-muted-foreground">Total Study Days</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Weekly Goal Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Study Hours</span>
                <span>12.5 / 15 hours</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Streak Tips</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Study for at least 30 minutes daily to maintain your streak</p>
              <p>• Set a consistent study time to build a habit</p>
              <p>• Use the Pomodoro technique for focused sessions</p>
              <p>• Review your progress weekly to stay motivated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
