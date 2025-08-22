"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, FileText, Award } from "lucide-react"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import { Progress } from "@/components/ui/progress"

interface PastSessionsProps {
  theme: string
}

// Update the card styling
const cardStyles = "bg-white/95 backdrop-blur-sm border-white/20 dark:bg-gray-900/95 dark:border-gray-800/20"

// Update the session item styling
const sessionItemStyles = "border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm"

// Update the empty state styling
const emptyStateStyles = "text-center py-8"
const emptyIconStyles = "h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600"
const emptyTextStyles = "text-gray-500 dark:text-gray-400"

// Update the notes styling
const notesStyles = "mt-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700"

export function PastSessions({ theme }: PastSessionsProps) {
  const { pastSessions } = useStudyCalendar()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-700">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            Cancelled
          </Badge>
        )
      case "missed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Missed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <BookOpen className="h-4 w-4" />
      case "quiz":
        return <FileText className="h-4 w-4" />
      case "review":
        return <BookOpen className="h-4 w-4" />
      case "practice":
        return <FileText className="h-4 w-4" />
      case "lab":
        return <BookOpen className="h-4 w-4" />
      case "exam":
        return <Award className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-200"
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-blue-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className={cardStyles}>
      <CardHeader>
        <CardTitle className="text-xl">Study History</CardTitle>
        <CardDescription>Your past study sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {pastSessions.length === 0 ? (
          <div className={emptyStateStyles}>
            <Clock className={emptyIconStyles} />
            <h3 className="text-lg font-medium mb-2">No past sessions</h3>
            <p className={emptyTextStyles}>Complete some study sessions to see your history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session.id} className={sessionItemStyles}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-gray-100">{getTypeIcon(session.type)}</div>
                      <h3 className="font-medium">{session.title}</h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="text-sm text-gray-500">{session.subject}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {session.status === "completed" && (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      {session.score !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>Score:</span>
                            <span className="font-medium">{session.score}%</span>
                          </div>
                          <Progress value={session.score} className={`h-2 ${getScoreColor(session.score)}`} />
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {session.actual_duration_minutes ? (
                          <>
                            Actual time: {Math.floor(session.actual_duration_minutes / 60)}h{" "}
                            {session.actual_duration_minutes % 60}m
                          </>
                        ) : (
                          <>
                            Planned time: {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className={notesStyles}>
                    <div className="font-medium text-xs text-gray-500 mb-1">Notes:</div>
                    {session.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
