"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Award, Flame, Trophy, ArrowRight, ArrowLeft } from "lucide-react"
import type { StudySession, StudyStreak } from "@/lib/services/study-calendar-service"

interface StudyStreakViewProps {
  theme: string
  streak: StudyStreak | null
  sessions: StudySession[]
}

export function StudyStreakView({ theme, streak, sessions }: StudyStreakViewProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [studyData, setStudyData] = useState<Record<string, number>>({})
  const [heatmapStats, setHeatmapStats] = useState({
    maxHours: 0,
    totalDays: 0,
    totalHours: 0,
  })

  // Process sessions to create heatmap data
  useEffect(() => {
    if (!sessions || sessions.length === 0) return

    const yearSessions = sessions.filter((session) => {
      const sessionYear = new Date(session.date).getFullYear()
      return sessionYear === year
    })

    // Group sessions by date and calculate hours
    const data: Record<string, number> = {}
    let maxHours = 0
    let totalHours = 0
    let totalDays = 0

    yearSessions.forEach((session) => {
      if (session.status === "completed") {
        const hours = (session.actual_duration_minutes || session.duration_minutes) / 60

        if (!data[session.date]) {
          data[session.date] = 0
          totalDays++
        }

        data[session.date] += hours
        totalHours += hours

        if (data[session.date] > maxHours) {
          maxHours = data[session.date]
        }
      }
    })

    setStudyData(data)
    setHeatmapStats({
      maxHours,
      totalDays,
      totalHours,
    })
  }, [sessions, year])

  const getThemeAccentColor = (themeName: string) => {
    const themes = {
      "gradient-blue": "text-blue-600",
      "gradient-green": "text-green-600",
      "gradient-purple": "text-purple-600",
      "gradient-orange": "text-orange-600",
      "gradient-pink": "text-pink-600",
      "gradient-teal": "text-teal-600",
    }
    return themes[themeName as keyof typeof themes] || themes["gradient-blue"]
  }

  const getThemeBgColor = (themeName: string) => {
    const themes = {
      "gradient-blue": "bg-blue-500",
      "gradient-green": "bg-green-500",
      "gradient-purple": "bg-purple-500",
      "gradient-orange": "bg-orange-500",
      "gradient-pink": "bg-pink-500",
      "gradient-teal": "bg-teal-500",
    }
    return themes[themeName as keyof typeof themes] || themes["gradient-blue"]
  }

  const getHeatmapColor = (hours: number) => {
    if (!hours) return "bg-gray-100"

    const intensity = Math.min(hours / (heatmapStats.maxHours || 1), 1)

    const themeColors: Record<string, string[]> = {
      "gradient-blue": ["bg-blue-50", "bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500"],
      "gradient-green": ["bg-green-50", "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500"],
      "gradient-purple": [
        "bg-purple-50",
        "bg-purple-100",
        "bg-purple-200",
        "bg-purple-300",
        "bg-purple-400",
        "bg-purple-500",
      ],
      "gradient-orange": [
        "bg-orange-50",
        "bg-orange-100",
        "bg-orange-200",
        "bg-orange-300",
        "bg-orange-400",
        "bg-orange-500",
      ],
      "gradient-pink": ["bg-pink-50", "bg-pink-100", "bg-pink-200", "bg-pink-300", "bg-pink-400", "bg-pink-500"],
      "gradient-teal": ["bg-teal-50", "bg-teal-100", "bg-teal-200", "bg-teal-300", "bg-teal-400", "bg-teal-500"],
    }

    const colors = themeColors[theme] || themeColors["gradient-blue"]
    const index = Math.floor(intensity * (colors.length - 1))
    return colors[index]
  }

  const generateCalendarData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const calendarData = []

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDay = new Date(year, month, 1).getDay()

      const monthData = {
        name: months[month],
        days: [] as { date: string; day: number; hours: number }[],
      }

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        monthData.days.push({ date: "", day: 0, hours: 0 })
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        const hours = studyData[date] || 0
        monthData.days.push({ date, day, hours })
      }

      calendarData.push(monthData)
    }

    return calendarData
  }

  const calendarData = generateCalendarData()

  if (!streak) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-8 text-center">
          <Flame className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Streak Data Available</h3>
          <p className="text-gray-600">Complete some study sessions to start your streak!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg">
              <Flame className={`h-12 w-12 mb-2 ${getThemeAccentColor(theme)}`} />
              <div className="text-4xl font-bold">{streak.current_streak}</div>
              <p className="text-gray-600 font-medium">Current Streak</p>
              <p className="text-sm text-gray-500">consecutive days</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
              <Trophy className={`h-12 w-12 mb-2 ${getThemeAccentColor(theme)}`} />
              <div className="text-4xl font-bold">{streak.longest_streak}</div>
              <p className="text-gray-600 font-medium">Longest Streak</p>
              <p className="text-sm text-gray-500">your personal best</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
              <Award className={`h-12 w-12 mb-2 ${getThemeAccentColor(theme)}`} />
              <div className="text-4xl font-bold">{heatmapStats.totalDays}</div>
              <p className="text-gray-600 font-medium">Total Study Days</p>
              <p className="text-sm text-gray-500">this year</p>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Streak Progress</h3>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{streak.current_streak}</span>
                <span className="text-gray-400">/</span>
                <span className="text-sm text-gray-500">{streak.longest_streak}</span>
              </div>
            </div>
            <Progress
              value={(streak.current_streak / (streak.longest_streak || 1)) * 100}
              className={`h-2 ${getThemeBgColor(theme)}`}
            />

            <div className="mt-4 text-sm text-gray-600">
              {streak.current_streak > 0 ? (
                <>
                  <span className="font-medium">Last study day:</span> {streak.last_study_date}
                </>
              ) : (
                <span>Start your streak by completing a study session today!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contribution Heatmap */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Study Contribution Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setYear(year - 1)}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {year - 1}
            </Button>
            <Badge variant="outline" className="text-base font-medium dark:border-gray-600 dark:text-gray-300">
              {year}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setYear(year + 1)}
              disabled={year >= new Date().getFullYear()}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:dark:text-gray-500"
            >
              {year + 1}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium">{heatmapStats.totalDays}</span>
                <span className="text-gray-500">days studied</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{heatmapStats.totalHours.toFixed(1)}</span>
                <span className="text-gray-500">total hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Less</span>
                <div className="flex gap-1">
                  {[
                    "bg-gray-100",
                    ...Array.from({ length: 5 }).map((_, i) => getHeatmapColor((i + 1) * (heatmapStats.maxHours / 5))),
                  ].map((color, i) => (
                    <div key={i} className={`w-3 h-3 ${color}`}></div>
                  ))}
                </div>
                <span className="text-gray-500">More</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {calendarData.map((month, monthIndex) => (
                <div key={monthIndex} className="space-y-2">
                  <h4 className="font-medium text-sm">{month.name}</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="w-6 h-6 flex items-center justify-center text-xs text-gray-400">
                        {day}
                      </div>
                    ))}

                    {month.days.map((day, dayIndex) => (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-6 h-6 ${day.date ? getHeatmapColor(day.hours) : "bg-transparent"} rounded-sm flex items-center justify-center text-xs ${day.hours > 0 ? "text-gray-700" : "text-gray-400"}`}
                            >
                              {day.day > 0 ? day.day : ""}
                            </div>
                          </TooltipTrigger>
                          {day.date && (
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{day.date}</div>
                                {day.hours > 0 ? (
                                  <div>{day.hours.toFixed(1)} hours studied</div>
                                ) : (
                                  <div>No study activity</div>
                                )}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
