"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function StudyStreakWidget() {
  const currentStreak = 28
  const weeklyGoal = 15 // hours
  const currentWeekHours = 12.5

  const streakDays = [
    { day: "M", completed: true },
    { day: "T", completed: true },
    { day: "W", completed: true },
    { day: "T", completed: true },
    { day: "F", completed: true },
    { day: "S", completed: false },
    { day: "S", completed: true },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
            className="text-orange-500"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
          <p className="text-sm text-muted-foreground">Days in a row</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">This Week</p>
          <div className="flex justify-between gap-1">
            {streakDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    day.completed ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {day.completed ? "✓" : day.day}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Weekly Goal</span>
            <span>
              {currentWeekHours}/{weeklyGoal}h
            </span>
          </div>
          <Progress value={(currentWeekHours / weeklyGoal) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
