"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import type React from "react"

interface StudyPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreatePlan?: (planData: any) => Promise<any>
}

interface PlanSession {
  day: string
  time: string
  subject: string
  duration: number
}

export function StudyPlanDialog({ open, onOpenChange, onCreatePlan }: StudyPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    weekly_hours_target: 20,
  })
  const [subjects, setSubjects] = useState<string[]>([""])
  const [sessions, setSessions] = useState<PlanSession[]>([{ day: "Monday", time: "09:00", subject: "", duration: 60 }])

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const addSubject = () => {
    setSubjects([...subjects, ""])
  }

  const updateSubject = (index: number, value: string) => {
    const newSubjects = [...subjects]
    newSubjects[index] = value
    setSubjects(newSubjects)
  }

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const addSession = () => {
    setSessions([...sessions, { day: "Monday", time: "09:00", subject: "", duration: 60 }])
  }

  const updateSession = (index: number, field: keyof PlanSession, value: string | number) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setSessions(newSessions)
  }

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.start_date || !formData.end_date) {
      alert("Please fill in all required fields")
      return
    }

    const validSubjects = subjects.filter((s) => s.trim())
    if (validSubjects.length === 0) {
      alert("Please add at least one subject")
      return
    }

    setIsLoading(true)
    try {
      const planData = {
        title: formData.title,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
        subjects: validSubjects,
        weekly_hours_target: formData.weekly_hours_target,
        sessions: sessions.filter((s) => s.subject.trim()),
      }

      if (onCreatePlan) {
        await onCreatePlan(planData)
      } else {
        console.log("Created study plan:", planData)
        onOpenChange(false)
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        weekly_hours_target: 20,
      })
      setSubjects([""])
      setSessions([{ day: "Monday", time: "09:00", subject: "", duration: 60 }])
    } catch (error) {
      console.error("Error creating study plan:", error)
      alert("Failed to create study plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Study Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Final Exam Preparation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly_hours">Weekly Hours Target</Label>
                <Input
                  id="weekly_hours"
                  type="number"
                  value={formData.weekly_hours_target}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weekly_hours_target: Number(e.target.value) }))}
                  min="1"
                  max="168"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your study plan goals and objectives..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={subject}
                    onChange={(e) => updateSubject(index, e.target.value)}
                    placeholder="e.g., Mathematics"
                    className="flex-1"
                  />
                  {subjects.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSubject(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSubject} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Day</Label>
                    <Select value={session.day} onValueChange={(value) => updateSession(index, "day", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={session.time}
                      onChange={(e) => updateSession(index, "time", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subject</Label>
                    <Select value={session.subject} onValueChange={(value) => updateSession(index, "subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects
                          .filter((s) => s.trim())
                          .map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={session.duration}
                      onChange={(e) => updateSession(index, "duration", Number(e.target.value))}
                      min="15"
                      max="480"
                      className="w-16"
                    />
                    <span className="text-xs text-gray-500 self-center">min</span>
                    {sessions.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeSession(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSession} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Study Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
