"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Calendar } from "lucide-react"
import type { StudySession } from "@/lib/services/study-calendar-service"
import type React from "react"

interface ReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateReminder?: (reminderData: any) => Promise<any>
  sessions?: StudySession[]
}

export function ReminderDialog({ open, onOpenChange, onCreateReminder, sessions = [] }: ReminderDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reminderType, setReminderType] = useState<"session" | "custom">("session")
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [reminderTime, setReminderTime] = useState<string>("15")
  const [customDate, setCustomDate] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  const upcomingSessions = sessions.filter(
    (session) => session.status === "scheduled" || session.status === "in_progress",
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let reminderDateTime: Date
    let reminderMessage = message

    if (reminderType === "session") {
      if (!selectedSession) {
        alert("Please select a session")
        return
      }

      const session = sessions.find((s) => s.id === selectedSession)
      if (!session) {
        alert("Invalid session selected")
        return
      }

      // Calculate reminder time based on session start time
      const sessionDateTime = new Date(`${session.date}T${session.start_time}:00`)
      reminderDateTime = new Date(sessionDateTime.getTime() - Number.parseInt(reminderTime) * 60 * 1000)

      // Default message if not provided
      if (!reminderMessage) {
        reminderMessage = `Reminder: Your ${session.subject} ${session.type} session starts in ${reminderTime} minutes`
      }
    } else {
      // Custom reminder
      if (!customDate || !customTime) {
        alert("Please select a date and time for your reminder")
        return
      }

      reminderDateTime = new Date(`${customDate}T${customTime}:00`)

      // Default message if not provided
      if (!reminderMessage) {
        reminderMessage = "Custom study reminder"
      }
    }

    // Check if reminder time is in the past
    if (reminderDateTime < new Date()) {
      alert("Reminder time cannot be in the past")
      return
    }

    setIsLoading(true)
    try {
      const reminderData = {
        session_id: reminderType === "session" ? selectedSession : undefined,
        reminder_time: reminderDateTime.toISOString(),
        message: reminderMessage,
        is_sent: false,
      }

      if (onCreateReminder) {
        await onCreateReminder(reminderData)
      } else {
        console.log("Created reminder:", reminderData)
        onOpenChange(false)
      }

      // Reset form
      setSelectedSession("")
      setReminderTime("15")
      setCustomDate("")
      setCustomTime("")
      setMessage("")
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("Failed to create reminder. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Study Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={reminderType === "session" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setReminderType("session")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                For Session
              </Button>
              <Button
                type="button"
                variant={reminderType === "custom" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setReminderType("custom")}
              >
                <Bell className="h-4 w-4 mr-2" />
                Custom Reminder
              </Button>
            </div>

            {reminderType === "session" ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session">Select Session</Label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingSessions.length > 0 ? (
                          upcomingSessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.date} • {session.start_time} • {session.subject}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No upcoming sessions
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder_time">Remind Me</Label>
                    <Select value={reminderTime} onValueChange={setReminderTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                        <SelectItem value="120">2 hours before</SelectItem>
                        <SelectItem value="1440">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom_date">Date</Label>
                      <Input
                        id="custom_date"
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        required={reminderType === "custom"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom_time">Time</Label>
                      <Input
                        id="custom_time"
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        required={reminderType === "custom"}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Reminder Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a custom reminder message..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Setting..." : "Set Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
