"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface StudySession {
  id: string
  title: string
  subject: string
  topic?: string
  date: string
  start_time: string
  end_time: string
  type: string
  priority: string
  notes?: string
}

interface EditSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: StudySession
  onUpdateSession: (updates: Partial<StudySession>) => Promise<void>
}

export function EditSessionDialog({ open, onOpenChange, session, onUpdateSession }: EditSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    topic: "",
    date: "",
    start_time: "",
    end_time: "",
    type: "study",
    priority: "medium",
    notes: "",
  })

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        subject: session.subject,
        topic: session.topic || "",
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time,
        type: session.type,
        priority: session.priority,
        notes: session.notes || "",
      })
    }
  }, [session])

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    return endMinutes - startMinutes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.subject || !formData.date || !formData.start_time || !formData.end_time) {
      alert("Please fill in all required fields")
      return
    }

    const duration = calculateDuration(formData.start_time, formData.end_time)
    if (duration <= 0) {
      alert("End time must be after start time")
      return
    }

    setIsLoading(true)
    try {
      await onUpdateSession({
        title: formData.title,
        subject: formData.subject,
        topic: formData.topic || undefined,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_minutes: duration,
        type: formData.type as any,
        priority: formData.priority as any,
        notes: formData.notes || undefined,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Study Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Biology Chapter 5 Review"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Biology"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., Cell Division"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or objectives..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
