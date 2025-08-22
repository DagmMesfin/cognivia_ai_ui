"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Play, Check, X } from "lucide-react"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import type { StudySession } from "@/lib/services/study-calendar-service"
import { CreateSessionDialog } from "./create-session-dialog"
import { EditSessionDialog } from "./edit-session-dialog"
import { CompleteSessionDialog } from "./complete-session-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UpcomingSessionsProps {
  theme: string
}

// Update the card styling
const cardStyles = "bg-white/95 backdrop-blur-sm border-white/20 dark:bg-gray-900/95 dark:border-gray-800/20"

// Update the session item styling
const sessionItemStyles = "border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm relative overflow-hidden"

// Update the empty state styling
const emptyStateStyles = "text-center py-8 text-gray-500 dark:text-gray-400"

export function UpcomingSessions({ theme }: UpcomingSessionsProps) {
  const { upcomingSessions, startSession, cancelSession, completeSession, getSessionStatusInfo, refreshData } =
    useStudyCalendar()
  const { toast } = useToast()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null)

  // For auto-refresh of time info
  const [, setRefreshTrigger] = useState(0)

  // Set up auto-refresh every 30 seconds
  useState(() => {
    const intervalId = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 30000)

    return () => clearInterval(intervalId)
  })

  const handleEdit = (session: StudySession) => {
    setSelectedSession(session)
    setEditDialogOpen(true)
  }

  const handleStart = async (session: StudySession) => {
    try {
      await startSession(session.id)
      toast({
        title: "Session started",
        description: `${session.title} has been started.`,
      })
      refreshData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session.",
        variant: "destructive",
      })
    }
  }

  const handleComplete = (session: StudySession) => {
    setSelectedSession(session)
    setCompleteDialogOpen(true)
  }

  const handleCancelClick = (session: StudySession) => {
    setSelectedSession(session)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedSession) return

    try {
      await cancelSession(selectedSession.id)
      toast({
        title: "Session cancelled",
        description: `${selectedSession.title} has been cancelled.`,
      })
      setCancelDialogOpen(false)
      refreshData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel session.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const getStatusBadge = (session: StudySession) => {
    const { status } = getSessionStatusInfo(session)

    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="default" className="bg-green-500">
            In Progress
          </Badge>
        )
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

  return (
    <>
      <Card className={cardStyles}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled study sessions</CardDescription>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="sm"
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add Session
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className={emptyStateStyles}>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
              <p className="mb-4">Schedule your next study session to get started</p>
              <Button onClick={() => setCreateDialogOpen(true)}>Schedule Session</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const { timeInfo, canComplete, canStart } = getSessionStatusInfo(session)

                return (
                  <div key={session.id} className={sessionItemStyles}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(session.priority)}`} />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{session.title}</h3>
                          {getStatusBadge(session)}
                        </div>
                        <div className="text-sm text-gray-500">{session.subject}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {session.start_time} - {session.end_time}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{timeInfo}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {canStart && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStart(session)}
                            className="dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {canComplete && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleComplete(session)}
                            className="dark:bg-green-600 dark:hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(session)}
                          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleCancelClick(session)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSessionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {selectedSession && (
        <>
          <EditSessionDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} session={selectedSession} />

          <CompleteSessionDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            session={selectedSession}
            onCompleteSession={completeSession}
          />

          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Study Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this study session? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
                  Yes, cancel session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  )
}
