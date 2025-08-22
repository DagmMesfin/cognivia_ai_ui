"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  studyCalendarService,
  type StudySession,
  type StudyPlan,
  type StudyReminder,
} from "@/lib/services/study-calendar-service"

export function useStudyCalendar() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([])
  const [pastSessions, setPastSessions] = useState<StudySession[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)
  const [plans, setPlans] = useState<StudyPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching data for user:", user.id)

      // Initialize sample data if needed
      await studyCalendarService.initializeSampleData(user.id)

      // Fetch all data - force recalculation of analytics and streak
      const allSessions = await studyCalendarService.getUserStudySessions(user.id)
      const upcoming = await studyCalendarService.getUpcomingSessions(user.id)
      const past = await studyCalendarService.getPastSessions(user.id)
      const userAnalytics = await studyCalendarService.getUserAnalytics(user.id) // This will recalculate
      const userStreak = await studyCalendarService.getUserStudyStreak(user.id) // This will recalculate
      const userPlans = await studyCalendarService.getUserStudyPlans(user.id)

      console.log("Fetched analytics:", userAnalytics)
      console.log("Fetched streak:", userStreak)

      setSessions(allSessions)
      setUpcomingSessions(upcoming)
      setPastSessions(past)
      setAnalytics(userAnalytics)
      setStreak(userStreak)
      setPlans(userPlans)
    } catch (err) {
      console.error("Error fetching study calendar data:", err)
      setError("Failed to load study calendar data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds to keep data current
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        fetchData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(intervalId)
  }, [fetchData, user])

  const refreshData = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const createSession = async (sessionData: Omit<StudySession, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      console.log("Creating session:", sessionData)
      const newSession = await studyCalendarService.createStudySession(user, sessionData)
      console.log("Session created:", newSession)

      // Immediately refresh data to show updates
      await refreshData()
      return newSession
    } catch (err) {
      console.error("Error creating session:", err)
      throw new Error("Failed to create session")
    }
  }

  const updateSession = async (sessionId: string, updates: Partial<StudySession>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      console.log("Updating session:", sessionId, updates)
      const updatedSession = await studyCalendarService.updateStudySession(user.id, sessionId, updates)

      // Immediately refresh data to show updates
      await refreshData()
      return updatedSession
    } catch (err) {
      console.error("Error updating session:", err)
      throw new Error("Failed to update session")
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const result = await studyCalendarService.deleteStudySession(user.id, sessionId)

      // Immediately refresh data to show updates
      await refreshData()
      return result
    } catch (err) {
      console.error("Error deleting session:", err)
      throw new Error("Failed to delete session")
    }
  }

  const startSession = async (sessionId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      console.log("Starting session:", sessionId)
      const result = await studyCalendarService.startSession(user.id, sessionId)

      // Immediately refresh data to show updates
      await refreshData()
      return result
    } catch (err) {
      console.error("Error starting session:", err)
      throw new Error("Failed to start session")
    }
  }

  const completeSession = async (sessionId: string, score?: number, notes?: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      console.log("Completing session:", sessionId, { score, notes })
      const result = await studyCalendarService.completeSession(user.id, sessionId, score, notes)

      // Immediately refresh data to show updates
      await refreshData()
      return result
    } catch (err) {
      console.error("Error completing session:", err)
      throw new Error("Failed to complete session")
    }
  }

  const createStudyPlan = async (planData: Omit<StudyPlan, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const newPlan = await studyCalendarService.createStudyPlan(user.id, planData)

      // Immediately refresh data to show updates
      await refreshData()
      return newPlan
    } catch (err) {
      console.error("Error creating study plan:", err)
      throw new Error("Failed to create study plan")
    }
  }

  const createReminder = async (reminderData: Omit<StudyReminder, "id" | "user_id" | "created_at">) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const newReminder = await studyCalendarService.createStudyReminder(user.id, reminderData)

      // Immediately refresh data to show updates
      await refreshData()
      return newReminder
    } catch (err) {
      console.error("Error creating reminder:", err)
      throw new Error("Failed to create reminder")
    }
  }

  const getSessionStatusInfo = (session: StudySession) => {
    return studyCalendarService.getSessionStatusInfo(session)
  }

  // Add the missing functions that ProfileStats needs
  const getUserAnalytics = useCallback(async () => {
    if (!user) throw new Error("User not authenticated")
    return await studyCalendarService.getUserAnalytics(user.id)
  }, [user])

  const getUserStudyStreak = useCallback(async () => {
    if (!user) throw new Error("User not authenticated")
    return await studyCalendarService.getUserStudyStreak(user.id)
  }, [user])

  const getSessionsByDateRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user) throw new Error("User not authenticated")
      return await studyCalendarService.getSessionsByDateRange(user.id, startDate, endDate)
    },
    [user],
  )

  return {
    sessions,
    upcomingSessions,
    pastSessions,
    analytics,
    streak,
    plans,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    completeSession,
    createStudyPlan,
    createReminder,
    refreshData,
    getSessionStatusInfo,
    // Add the missing functions
    getUserAnalytics,
    getUserStudyStreak,
    getSessionsByDateRange,
  }
}
