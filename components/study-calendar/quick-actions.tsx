"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Bell, BookOpen, BarChart3 } from "lucide-react"

interface QuickActionsProps {
  theme: string
  onViewProgress?: () => void
  onScheduleSession?: () => void
  onCreateStudyPlan?: () => void
  onSetReminder?: () => void
}

export function QuickActions({
  theme,
  onViewProgress,
  onScheduleSession,
  onCreateStudyPlan,
  onSetReminder,
}: QuickActionsProps) {
  const getThemeButtonClass = (theme: string) => {
    const classes = {
      "gradient-blue": "bg-blue-600 hover:bg-blue-700",
      "gradient-green": "bg-green-600 hover:bg-green-700",
      "gradient-purple": "bg-purple-600 hover:bg-purple-700",
      "gradient-orange": "bg-orange-600 hover:bg-orange-700",
      "gradient-pink": "bg-pink-600 hover:bg-pink-700",
      "gradient-teal": "bg-teal-600 hover:bg-teal-700",
    }
    return classes[theme as keyof typeof classes] || classes["gradient-blue"]
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={onScheduleSession}
            className={`${getThemeButtonClass(theme)} text-white shadow-sm h-auto py-4 flex flex-col items-center`}
          >
            <CalendarPlus className="h-6 w-6 mb-2" />
            <span>Schedule Session</span>
          </Button>

          <Button
            onClick={onSetReminder}
            className={`${getThemeButtonClass(theme)} text-white shadow-sm h-auto py-4 flex flex-col items-center`}
          >
            <Bell className="h-6 w-6 mb-2" />
            <span>Set Reminder</span>
          </Button>

          <Button
            onClick={onCreateStudyPlan}
            className={`${getThemeButtonClass(theme)} text-white shadow-sm h-auto py-4 flex flex-col items-center`}
          >
            <BookOpen className="h-6 w-6 mb-2" />
            <span>Create Study Plan</span>
          </Button>

          <Button
            onClick={onViewProgress}
            className={`${getThemeButtonClass(theme)} text-white shadow-sm h-auto py-4 flex flex-col items-center`}
          >
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>View Progress</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
