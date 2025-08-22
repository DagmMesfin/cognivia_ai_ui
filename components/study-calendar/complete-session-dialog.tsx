"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

interface StudySession {
  id: string
  title: string
  subject: string
  topic?: string
  date: string
  start_time: string
  end_time: string
}

interface CompleteSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: StudySession
  onCompleteSession: (sessionId: string, score?: number, notes?: string) => Promise<void>
}

export function CompleteSessionDialog({ open, onOpenChange, session, onCompleteSession }: CompleteSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [score, setScore] = useState<number>(85)
  const [notes, setNotes] = useState("")
  const [includeScore, setIncludeScore] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      await onCompleteSession(session.id, includeScore ? score : undefined, notes.trim() || undefined)

      onOpenChange(false)
      setScore(85)
      setNotes("")
      setIncludeScore(true)
    } catch (error) {
      console.error("Error completing session:", error)
      alert("Failed to complete session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Study Session</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">{session.title}</h3>
          <p className="text-sm text-gray-600">{session.subject}</p>
          {session.topic && <p className="text-sm text-gray-500">{session.topic}</p>}
          <p className="text-sm text-gray-500">
            {session.date} • {session.start_time} - {session.end_time}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeScore"
                checked={includeScore}
                onChange={(e) => setIncludeScore(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="includeScore">Include performance score</Label>
            </div>

            {includeScore && (
              <div className="space-y-3">
                <Label>Performance Score: {score}%</Label>
                <Slider
                  value={[score]}
                  onValueChange={(value) => setScore(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go? What did you learn? Any challenges?"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Completing..." : "Complete Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
