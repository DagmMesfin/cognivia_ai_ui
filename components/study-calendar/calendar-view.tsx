"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BookOpen, Calendar } from "lucide-react"
import type { StudySession, StudyPlan } from "@/lib/services/study-calendar-service"

interface CalendarViewProps {
  sessions?: StudySession[]
  plans?: StudyPlan[]
}

export function CalendarView({ sessions = [], plans = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPlans, setShowPlans] = useState(true)
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(true)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Group sessions by date - safely handle undefined/null sessions
  const sessionsByDate = (sessions || []).reduce(
    (acc, session) => {
      if (session && session.date) {
        if (!acc[session.date]) {
          acc[session.date] = []
        }
        acc[session.date].push(session)
      }
      return acc
    },
    {} as Record<string, StudySession[]>,
  )

  // Get plan dates - extract all dates that fall within plan date ranges
  const planDates: Record<string, StudyPlan[]> = {}

  if (showPlans && plans && plans.length > 0) {
    plans.forEach((plan) => {
      const startDate = new Date(plan.start_date)
      const endDate = new Date(plan.end_date)

      // For each day in the plan's date range
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0]
        if (!planDates[dateStr]) {
          planDates[dateStr] = []
        }
        planDates[dateStr].push(plan)

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
  }

  // Generate weekly schedule from plans
  const weeklySchedule: Record<string, Array<{ time: string; subject: string; duration: number }>> = {}

  if (showWeeklySchedule && plans && plans.length > 0) {
    plans.forEach((plan) => {
      plan.sessions.forEach((session) => {
        // Map day names to dates in current month
        const dayIndex = dayNames.indexOf(session.day)
        if (dayIndex !== -1) {
          // Find all dates in current month that match this day of week
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            if (date.getDay() === dayIndex) {
              const dateStr = date.toISOString().split("T")[0]
              if (!weeklySchedule[dateStr]) {
                weeklySchedule[dateStr] = []
              }
              weeklySchedule[dateStr].push({
                time: session.time,
                subject: session.subject,
                duration: session.duration,
              })
            }
          }
        }
      })
    })
  }

  // Update the day header styling
  const dayHeaderStyles =
    "p-3 text-center font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded"

  // Update the day cell styling
  const dayCellStyles =
    "p-2 h-32 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
  const todayCellStyles = "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
  const regularCellStyles = "border-gray-200 dark:border-gray-700"

  // Update the session type colors
  const getSessionColor = (type: string, status: string) => {
    if (status === "completed") {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
    }
    if (status === "missed") {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
    }
    if (status === "in_progress") {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
    }
    if (status === "cancelled") {
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }

    switch (type) {
      case "quiz":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
      case "study":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
      case "review":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
      case "practice":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800"
      case "exam":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }
  }

  // Update the weekly schedule color
  const getWeeklyScheduleColor = () => {
    return "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800"
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlans(!showPlans)}
              className={`${showPlans ? "bg-blue-50 dark:bg-blue-900/30" : ""} dark:border-gray-600 dark:text-gray-300`}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              {showPlans ? "Hide Plans" : "Show Plans"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
              className={`${showWeeklySchedule ? "bg-indigo-50 dark:bg-indigo-900/30" : ""} dark:border-gray-600 dark:text-gray-300`}
            >
              <Calendar className="h-4 w-4 mr-1" />
              {showWeeklySchedule ? "Hide Schedule" : "Show Schedule"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div key={day} className={dayHeaderStyles}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <div key={`empty-${index}`} className="p-2 h-32" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const daySessions = sessionsByDate[dateStr] || []
            const dayPlans = planDates[dateStr] || []
            const dayWeeklySchedule = weeklySchedule[dateStr] || []

            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()

            // Calculate available slots for display
            let availableSlots = 3
            if (showPlans && dayPlans.length > 0) availableSlots--
            if (showWeeklySchedule && dayWeeklySchedule.length > 0) availableSlots--

            return (
              <div key={day} className={`${dayCellStyles} ${isToday ? todayCellStyles : regularCellStyles}`}>
                <div className="font-bold text-lg mb-1">{day}</div>
                <div className="space-y-1 overflow-y-auto max-h-20">
                  {/* Study Plans */}
                  {showPlans && dayPlans.length > 0 && (
                    <div className={`p-1 rounded text-xs border bg-green-50 text-green-800 border-green-200`}>
                      <div className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span className="font-medium truncate">
                          {dayPlans.length > 1 ? `${dayPlans.length} Plans` : dayPlans[0].title}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule */}
                  {showWeeklySchedule && dayWeeklySchedule.length > 0 && (
                    <div className={`p-1 rounded text-xs border ${getWeeklyScheduleColor()}`}>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="font-medium truncate">
                          {dayWeeklySchedule.length > 1
                            ? `${dayWeeklySchedule.length} Scheduled`
                            : `${dayWeeklySchedule[0].subject} ${dayWeeklySchedule[0].time}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Study Sessions */}
                  {daySessions.slice(0, availableSlots).map((session, idx) => (
                    <div
                      key={idx}
                      className={`p-1 rounded text-xs border ${getSessionColor(session.type, session.status)}`}
                    >
                      <div className="font-medium truncate">{session.subject}</div>
                      <div className="truncate">{session.start_time}</div>
                    </div>
                  ))}

                  {/* Show more indicator */}
                  {(daySessions.length > availableSlots ||
                    (showPlans && dayPlans.length > 1) ||
                    (showWeeklySchedule && dayWeeklySchedule.length > 1)) && (
                    <div className="text-xs text-gray-500 font-medium">
                      +
                      {Math.max(
                        0,
                        daySessions.length -
                          availableSlots +
                          (showPlans && dayPlans.length > 1 ? dayPlans.length - 1 : 0) +
                          (showWeeklySchedule && dayWeeklySchedule.length > 1 ? dayWeeklySchedule.length - 1 : 0),
                      )}{" "}
                      more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading state when sessions are not available */}
        {!sessions && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="text-gray-500">Loading calendar data...</div>
          </div>
        )}

        {/* Empty state when no sessions */}
        {sessions && sessions.length === 0 && !plans?.length && (
          <div className="text-center py-8 text-gray-500">
            <p>No study sessions, plans, or schedules.</p>
            <p className="text-sm">Create your first session to get started!</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className={`flex items-center gap-1`}>
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Study Sessions</span>
          </div>
          {showPlans && (
            <div className={`flex items-center gap-1`}>
              <div className={`w-3 h-3 bg-green-50 border border-green-200 rounded`}></div>
              <span>Study Plans</span>
            </div>
          )}
          {showWeeklySchedule && (
            <div className={`flex items-center gap-1`}>
              <div className="w-3 h-3 bg-indigo-50 border border-indigo-200 rounded"></div>
              <span>Weekly Schedule</span>
            </div>
          )}
          <div className={`flex items-center gap-1`}>
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Completed</span>
          </div>
          <div className={`flex items-center gap-1`}>
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className={`flex items-center gap-1`}>
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
