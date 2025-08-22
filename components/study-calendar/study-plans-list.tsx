"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp, Calendar, Clock, Target } from "lucide-react"
import type { StudyPlan } from "@/lib/services/study-calendar-service"

interface StudyPlansListProps {
  theme: string
  plans: StudyPlan[]
}

export function StudyPlansList({ theme, plans }: StudyPlansListProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const togglePlan = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId)
  }

  const getThemeAccentColor = (theme: string) => {
    const colors = {
      "gradient-blue": "bg-blue-500",
      "gradient-green": "bg-green-500",
      "gradient-purple": "bg-purple-500",
      "gradient-orange": "bg-orange-500",
      "gradient-pink": "bg-pink-500",
      "gradient-teal": "bg-teal-500",
    }
    return colors[theme as keyof typeof colors] || colors["gradient-blue"]
  }

  const getThemeTextColor = (theme: string) => {
    const colors = {
      "gradient-blue": "text-blue-600",
      "gradient-green": "text-green-600",
      "gradient-purple": "text-purple-600",
      "gradient-orange": "text-orange-600",
      "gradient-pink": "text-pink-600",
      "gradient-teal": "text-teal-600",
    }
    return colors[theme as keyof typeof colors] || colors["gradient-blue"]
  }

  const getThemeBorderColor = (theme: string) => {
    const colors = {
      "gradient-blue": "border-blue-200",
      "gradient-green": "border-green-200",
      "gradient-purple": "border-purple-200",
      "gradient-orange": "border-orange-200",
      "gradient-pink": "border-pink-200",
      "gradient-teal": "border-teal-200",
    }
    return colors[theme as keyof typeof colors] || colors["gradient-blue"]
  }

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const daysElapsed = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    if (daysElapsed < 0) return 0
    if (daysElapsed > totalDays) return 100

    return Math.round((daysElapsed / totalDays) * 100)
  }

  // Update the card styling
  const cardStyles = "bg-white/95 backdrop-blur-sm border-white/20 dark:bg-gray-900/95 dark:border-gray-800/20"

  // Update the plan item styling
  const planItemStyles = "border hover:shadow-md transition-shadow bg-card dark:border-gray-800"

  // Update the empty state styling
  const emptyStateStyles = "text-center text-gray-500 dark:text-gray-400 py-4"

  if (!plans || plans.length === 0) {
    return (
      <Card className={cardStyles}>
        <CardHeader>
          <CardTitle>Study Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={emptyStateStyles}>
            No study plans created yet. Use the "Create Study Plan" quick action to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardStyles}>
      <CardHeader>
        <CardTitle>Study Plans ({plans.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id
          const daysRemaining = calculateDaysRemaining(plan.end_date)
          const progress = calculateProgress(plan.start_date, plan.end_date)

          return (
            <Card
              key={plan.id}
              className={`${planItemStyles} border ${getThemeBorderColor(theme)} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${getThemeTextColor(theme)}`}>{plan.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {plan.start_date} to {plan.end_date}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : "Completed"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlan(plan.id)}
                    className={getThemeTextColor(theme)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className={`h-2 ${getThemeAccentColor(theme)}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {plan.description && <div className="text-sm text-gray-600">{plan.description}</div>}

                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Weekly target: {plan.weekly_hours_target} hours</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Subjects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {plan.sessions && plan.sessions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Weekly Schedule:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {plan.sessions.map((session, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm border rounded p-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="font-medium">{session.day}</span>
                              <span className="text-gray-600">
                                {session.time} • {session.subject} • {session.duration} min
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}
