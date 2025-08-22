"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react"

interface StudyStreakLeetcodeProps {
  onClose: () => void
}

export function StudyStreakLeetcode({ onClose }: StudyStreakLeetcodeProps) {
  const [selectedYear, setSelectedYear] = useState(2025)
  const years = [2024, 2025, 2026]

  // Mock data for study activity (separate from study calendar)
  const totalDaysStudied = 8
  const totalHours = 12.3

  // Generate calendar data for the year
  const generateCalendarData = () => {
    const months = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(selectedYear, month, 1)
      const lastDay = new Date(selectedYear, month + 1, 0)
      const daysInMonth = lastDay.getDate()

      const days = []

      // Fill in days for the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, month, day)
        const dayOfWeek = date.getDay()

        // Generate random activity level (0-4) for study activities
        let activityLevel = 0
        if (Math.random() < 0.18) {
          activityLevel = Math.floor(Math.random() * 4) + 1
        }

        // Add some specific activity patterns for demo
        if (month === 4 && (day === 15 || day === 16 || day === 17)) {
          activityLevel = 4
        }
        if (month === 5 && (day === 3 || day === 10 || day === 17 || day === 24)) {
          activityLevel = 3
        }

        days.push({
          day,
          dayOfWeek,
          activityLevel,
          hours: activityLevel > 0 ? (Math.random() * 3 + 0.5).toFixed(1) : 0,
        })
      }

      months.push({
        name: monthNames[month],
        days,
      })
    }

    return months
  }

  const calendarData = generateCalendarData()

  const getActivityClass = (level: number) => {
    if (level === 0) return "bg-transparent border border-gray-700"
    if (level === 1) return "bg-green-900"
    if (level === 2) return "bg-green-700"
    if (level === 3) return "bg-green-500"
    if (level === 4) return "bg-green-400"
    return "bg-transparent border border-gray-700"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-gray-900 border-gray-800 text-gray-100">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <CardTitle>Study Activity Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-gray-700 overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border-r border-gray-700 px-3 hover:bg-gray-800"
                onClick={() => setSelectedYear((prev) => Math.max(2020, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none px-3 hover:bg-gray-800"
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border-l border-gray-700 px-3 hover:bg-gray-800"
                onClick={() => setSelectedYear((prev) => Math.min(2030, prev + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-lg font-bold text-green-400">{totalDaysStudied}</span>
                <span className="text-gray-400 ml-2">days with study activity</span>
              </div>
              <div>
                <span className="text-lg font-bold text-green-400">{totalHours}</span>
                <span className="text-gray-400 ml-2">total study hours</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 border border-gray-700"></div>
                <div className="h-3 w-3 bg-green-900"></div>
                <div className="h-3 w-3 bg-green-700"></div>
                <div className="h-3 w-3 bg-green-500"></div>
                <div className="h-3 w-3 bg-green-400"></div>
              </div>
              <span className="text-sm text-gray-400">More</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {calendarData.map((month, monthIndex) => (
              <div key={monthIndex} className="flex flex-col">
                <h3 className="text-sm font-medium mb-2 text-green-400">{month.name}</h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {/* Days of week headers */}
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="h-6 flex items-center justify-center text-gray-500">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for first week */}
                  {Array.from({ length: month.days[0].dayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-6"></div>
                  ))}

                  {/* Days of the month */}
                  {month.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`h-6 w-6 flex items-center justify-center text-xs rounded-sm cursor-pointer hover:ring-1 hover:ring-green-400 ${getActivityClass(day.activityLevel)}`}
                      title={
                        day.activityLevel > 0
                          ? `${day.hours} hours of study activity on ${month.name} ${day.day}, ${selectedYear}`
                          : `No study activity on ${month.name} ${day.day}, ${selectedYear}`
                      }
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              This calendar tracks your overall study activities and learning progress, separate from scheduled study
              sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
