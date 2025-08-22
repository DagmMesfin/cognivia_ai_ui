"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import { useNotebooks } from "@/lib/hooks/use-notebooks"
import { Clock, BookOpen, Calendar, CheckCircle, XCircle, PlayCircle, Filter } from "lucide-react"
import { format } from "date-fns"

interface ProfileActivityProps {
  userId: string
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const { sessions, studyPlans, isLoading } = useStudyCalendar()
  const { notebooks } = useNotebooks()
  const [filter, setFilter] = useState<"all" | "sessions" | "plans" | "notebooks">("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatDuration = (minutes: number) => {
    if (!minutes) return "--"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
  }

  // Combine and sort all activities
  const getAllActivities = () => {
    const activities: any[] = []

    // Add sessions
    if (sessions && filter !== "plans" && filter !== "notebooks") {
      sessions.forEach((session) => {
        activities.push({
          type: "session",
          id: session.id,
          title: session.title,
          subject: session.subject,
          status: session.status,
          date: new Date(session.date),
          duration: session.actual_duration_minutes || session.duration_minutes,
          score: session.score,
          icon: <BookOpen className="w-4 h-4" />,
        })
      })
    }

    // Add study plans
    if (studyPlans && filter !== "sessions" && filter !== "notebooks") {
      studyPlans.forEach((plan) => {
        activities.push({
          type: "plan",
          id: plan.id,
          title: plan.title,
          subject: plan.subject,
          status: "active",
          date: new Date(plan.created_at),
          duration: null,
          score: null,
          icon: <Calendar className="w-4 h-4" />,
        })
      })
    }

    // Add notebooks
    if (notebooks && filter !== "sessions" && filter !== "plans") {
      notebooks.forEach((notebook) => {
        activities.push({
          type: "notebook",
          id: notebook.id,
          title: notebook.title,
          subject: notebook.subject,
          status: "active",
          date: new Date(notebook.created_at),
          duration: null,
          score: null,
          icon: <BookOpen className="w-4 h-4" />,
        })
      })
    }

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  const activities = getAllActivities()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest study activities and progress</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button
                variant={filter === "sessions" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("sessions")}
              >
                Sessions
              </Button>
              <Button variant={filter === "plans" ? "default" : "outline"} size="sm" onClick={() => setFilter("plans")}>
                Plans
              </Button>
              <Button
                variant={filter === "notebooks" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("notebooks")}
              >
                Notebooks
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground">
                Start studying to see your activity here. Create a session or study plan to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card
              key={`${activity.type}-${activity.id}`}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">{activity.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{activity.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Badge>
                          {activity.subject && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {activity.subject}
                            </Badge>
                          )}
                          {activity.status && activity.type === "session" && (
                            <Badge className={`text-xs border ${getStatusColor(activity.status)}`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(activity.status)}
                                {activity.status.replace("_", " ")}
                              </div>
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <p>{format(activity.date, "MMM dd, yyyy")}</p>
                        <p>{format(activity.date, "h:mm a")}</p>
                      </div>
                    </div>

                    {(activity.duration || activity.score) && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {activity.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(activity.duration)}
                          </div>
                        )}
                        {activity.score && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {activity.score}% score
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
