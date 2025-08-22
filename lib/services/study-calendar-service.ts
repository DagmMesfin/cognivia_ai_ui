import type { User } from "@/lib/api/auth"

export interface StudySession {
  id: string
  user_id: string
  title: string
  subject: string
  topic?: string
  date: string // YYYY-MM-DD format
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  duration_minutes: number
  type: "study" | "quiz" | "review" | "practice" | "lab" | "exam"
  priority: "low" | "medium" | "high"
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "missed"
  score?: number // 0-100 for completed sessions with assessments
  notes?: string
  actual_start_time?: string // When user actually started
  actual_end_time?: string // When user actually ended
  actual_duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface StudyGoal {
  id: string
  user_id: string
  subject: string
  target_hours_per_week: number
  target_sessions_per_week: number
  created_at: string
  updated_at: string
}

export interface StudyStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string
  updated_at: string
}

export interface StudyAnalytics {
  user_id: string
  total_hours: number
  total_sessions: number
  average_score: number
  subjects_studied: string[]
  most_productive_time: string
  weekly_hours: Array<{ day: string; hours: number; target: number }>
  subject_progress: Array<{
    subject: string
    progress: number
    hours: number
    color: string
  }>
  insights: {
    most_productive_time: string
    strongest_subject: string
    improvement_area: string
  }
}

export interface StudyPlan {
  id: string
  user_id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  subjects: string[]
  weekly_hours_target: number
  sessions: Array<{
    day: string
    time: string
    subject: string
    duration: number
  }>
  created_at: string
  updated_at: string
}

export interface StudyReminder {
  id: string
  user_id: string
  session_id: string
  reminder_time: string // ISO string
  message: string
  is_sent: boolean
  created_at: string
}

class StudyCalendarService {
  // In-memory storage (primary)
  private memoryStorage = {
    sessions: new Map<string, StudySession[]>(), // userId -> sessions[]
    goals: new Map<string, StudyGoal[]>(), // userId -> goals[]
    streaks: new Map<string, StudyStreak>(), // userId -> streak
    analytics: new Map<string, StudyAnalytics>(), // userId -> analytics
    plans: new Map<string, StudyPlan[]>(), // userId -> plans[]
    reminders: new Map<string, StudyReminder[]>(), // userId -> reminders[]
  }

  private readonly STORAGE_KEYS = {
    SESSIONS: "cognivia_study_sessions",
    GOALS: "cognivia_study_goals",
    STREAK: "cognivia_study_streak",
    ANALYTICS: "cognivia_study_analytics",
    PLANS: "cognivia_study_plans",
    REMINDERS: "cognivia_study_reminders",
  }

  constructor() {
    // Load data from localStorage on initialization
    this.loadFromLocalStorage()
    // Start time tracking
    this.startTimeTracking()
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get current timestamp
  private getCurrentTimestamp(): string {
    return new Date().toISOString()
  }

  // Time tracking
  private startTimeTracking(): void {
    if (typeof window === "undefined") return

    // Check every minute for session status updates
    setInterval(() => {
      this.updateSessionStatuses()
    }, 60000) // 60 seconds

    // Initial check
    setTimeout(() => this.updateSessionStatuses(), 1000)
  }

  private async updateSessionStatuses(): Promise<void> {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

    let hasUpdates = false

    // Check all users' sessions
    for (const [userId, sessions] of this.memoryStorage.sessions.entries()) {
      for (const session of sessions) {
        const sessionDateTime = new Date(`${session.date}T${session.start_time}:00`)
        const sessionEndDateTime = new Date(`${session.date}T${session.end_time}:00`)

        let newStatus = session.status

        // Check if session should start
        if (
          session.status === "scheduled" &&
          session.date === currentDate &&
          currentTime >= session.start_time &&
          currentTime < session.end_time
        ) {
          newStatus = "in_progress"
          session.actual_start_time = this.getCurrentTimestamp()
        }

        // Check if session should end (missed)
        if (
          (session.status === "scheduled" || session.status === "in_progress") &&
          (session.date < currentDate || (session.date === currentDate && currentTime > session.end_time))
        ) {
          if (session.status === "in_progress") {
            // If it was in progress, mark as completed
            newStatus = "completed"
            session.actual_end_time = this.getCurrentTimestamp()
            if (session.actual_start_time) {
              const actualStart = new Date(session.actual_start_time)
              const actualEnd = new Date(session.actual_end_time)
              session.actual_duration_minutes = Math.round((actualEnd.getTime() - actualStart.getTime()) / 60000)
            }
          } else {
            // If it was scheduled but never started, mark as missed
            newStatus = "missed"
          }
        }

        if (newStatus !== session.status) {
          session.status = newStatus
          session.updated_at = this.getCurrentTimestamp()
          hasUpdates = true
        }
      }
    }

    if (hasUpdates) {
      this.saveToLocalStorage()
      // Update analytics and streaks for all users
      for (const userId of this.memoryStorage.sessions.keys()) {
        await this.updateAnalytics(userId)
        await this.updateStudyStreak(userId)
      }
    }
  }

  // Get session status info
  getSessionStatusInfo(session: StudySession): {
    status: string
    timeInfo: string
    canComplete: boolean
    canStart: boolean
  } {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5)

    const sessionDate = session.date
    const startTime = session.start_time
    const endTime = session.end_time

    const isToday = sessionDate === currentDate
    const hasStarted = isToday && currentTime >= startTime
    const hasEnded = sessionDate < currentDate || (isToday && currentTime > endTime)

    let timeInfo = ""
    let canComplete = false
    let canStart = false

    switch (session.status) {
      case "scheduled":
        if (hasEnded) {
          timeInfo = "Missed"
        } else if (hasStarted) {
          timeInfo = "Ready to start"
          canStart = true
        } else if (isToday) {
          const minutesUntilStart = this.getMinutesUntil(startTime)
          timeInfo = `Starts in ${minutesUntilStart} minutes`
        } else {
          timeInfo = `Scheduled for ${sessionDate}`
        }
        break

      case "in_progress":
        if (hasEnded) {
          timeInfo = "Session ended"
          canComplete = true
        } else {
          const minutesRemaining = this.getMinutesUntil(endTime)
          timeInfo = `${minutesRemaining} minutes remaining`
          canComplete = true
        }
        break

      case "completed":
        timeInfo = "Completed"
        break

      case "cancelled":
        timeInfo = "Cancelled"
        break

      case "missed":
        timeInfo = "Missed"
        break
    }

    return {
      status: session.status,
      timeInfo,
      canComplete,
      canStart,
    }
  }

  private getMinutesUntil(timeString: string): number {
    const now = new Date()
    const [hours, minutes] = timeString.split(":").map(Number)
    const targetTime = new Date()
    targetTime.setHours(hours, minutes, 0, 0)

    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1)
    }

    return Math.round((targetTime.getTime() - now.getTime()) / 60000)
  }

  // Load data from localStorage to memory
  private loadFromLocalStorage(): void {
    if (typeof window === "undefined") return

    try {
      // Load sessions
      const sessionsData = localStorage.getItem(this.STORAGE_KEYS.SESSIONS)
      if (sessionsData) {
        const sessions: StudySession[] = JSON.parse(sessionsData)
        const sessionsByUser = new Map<string, StudySession[]>()
        sessions.forEach((session) => {
          if (!sessionsByUser.has(session.user_id)) {
            sessionsByUser.set(session.user_id, [])
          }
          sessionsByUser.get(session.user_id)!.push(session)
        })
        this.memoryStorage.sessions = sessionsByUser
      }

      // Load other data similarly...
      const goalsData = localStorage.getItem(this.STORAGE_KEYS.GOALS)
      if (goalsData) {
        const goals: StudyGoal[] = JSON.parse(goalsData)
        const goalsByUser = new Map<string, StudyGoal[]>()
        goals.forEach((goal) => {
          if (!goalsByUser.has(goal.user_id)) {
            goalsByUser.set(goal.user_id, [])
          }
          goalsByUser.get(goal.user_id)!.push(goal)
        })
        this.memoryStorage.goals = goalsByUser
      }

      const streaksData = localStorage.getItem(this.STORAGE_KEYS.STREAK)
      if (streaksData) {
        const streaks: StudyStreak[] = JSON.parse(streaksData)
        streaks.forEach((streak) => {
          this.memoryStorage.streaks.set(streak.user_id, streak)
        })
      }

      const analyticsData = localStorage.getItem(this.STORAGE_KEYS.ANALYTICS)
      if (analyticsData) {
        const analytics: StudyAnalytics[] = JSON.parse(analyticsData)
        analytics.forEach((analytic) => {
          this.memoryStorage.analytics.set(analytic.user_id, analytic)
        })
      }

      const plansData = localStorage.getItem(this.STORAGE_KEYS.PLANS)
      if (plansData) {
        const plans: StudyPlan[] = JSON.parse(plansData)
        const plansByUser = new Map<string, StudyPlan[]>()
        plans.forEach((plan) => {
          if (!plansByUser.has(plan.user_id)) {
            plansByUser.set(plan.user_id, [])
          }
          plansByUser.get(plan.user_id)!.push(plan)
        })
        this.memoryStorage.plans = plansByUser
      }

      const remindersData = localStorage.getItem(this.STORAGE_KEYS.REMINDERS)
      if (remindersData) {
        const reminders: StudyReminder[] = JSON.parse(remindersData)
        const remindersByUser = new Map<string, StudyReminder[]>()
        reminders.forEach((reminder) => {
          if (!remindersByUser.has(reminder.user_id)) {
            remindersByUser.set(reminder.user_id, [])
          }
          remindersByUser.get(reminder.user_id)!.push(reminder)
        })
        this.memoryStorage.reminders = remindersByUser
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }

  // Save data to localStorage
  private saveToLocalStorage(): void {
    if (typeof window === "undefined") return

    try {
      // Save sessions
      const allSessions: StudySession[] = []
      this.memoryStorage.sessions.forEach((sessions) => {
        allSessions.push(...sessions)
      })
      localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions))

      // Save goals
      const allGoals: StudyGoal[] = []
      this.memoryStorage.goals.forEach((goals) => {
        allGoals.push(...goals)
      })
      localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(allGoals))

      // Save streaks
      const allStreaks: StudyStreak[] = Array.from(this.memoryStorage.streaks.values())
      localStorage.setItem(this.STORAGE_KEYS.STREAK, JSON.stringify(allStreaks))

      // Save analytics
      const allAnalytics: StudyAnalytics[] = Array.from(this.memoryStorage.analytics.values())
      localStorage.setItem(this.STORAGE_KEYS.ANALYTICS, JSON.stringify(allAnalytics))

      // Save plans
      const allPlans: StudyPlan[] = []
      this.memoryStorage.plans.forEach((plans) => {
        allPlans.push(...plans)
      })
      localStorage.setItem(this.STORAGE_KEYS.PLANS, JSON.stringify(allPlans))

      // Save reminders
      const allReminders: StudyReminder[] = []
      this.memoryStorage.reminders.forEach((reminders) => {
        allReminders.push(...reminders)
      })
      localStorage.setItem(this.STORAGE_KEYS.REMINDERS, JSON.stringify(allReminders))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  // Study Sessions CRUD
  async createStudySession(
    user: User,
    sessionData: Omit<StudySession, "id" | "user_id" | "created_at" | "updated_at">,
  ): Promise<StudySession> {
    const session: StudySession = {
      ...sessionData,
      id: this.generateId(),
      user_id: user.id,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    }

    // Add to memory
    if (!this.memoryStorage.sessions.has(user.id)) {
      this.memoryStorage.sessions.set(user.id, [])
    }
    this.memoryStorage.sessions.get(user.id)!.push(session)

    // Save to localStorage
    this.saveToLocalStorage()

    // Update analytics and streak
    await this.updateAnalytics(user.id)
    await this.updateStudyStreak(user.id)

    console.log("Created session:", session)
    console.log("Total sessions for user:", this.memoryStorage.sessions.get(user.id)?.length)

    return session
  }

  async getUserStudySessions(userId: string): Promise<StudySession[]> {
    const sessions = this.memoryStorage.sessions.get(userId) || []
    console.log("Getting sessions for user:", userId, "Count:", sessions.length)
    return [...sessions] // Return a copy
  }

  async getStudySession(userId: string, sessionId: string): Promise<StudySession | null> {
    const sessions = this.memoryStorage.sessions.get(userId) || []
    return sessions.find((session) => session.id === sessionId) || null
  }

  async updateStudySession(
    userId: string,
    sessionId: string,
    updates: Partial<StudySession>,
  ): Promise<StudySession | null> {
    const sessions = this.memoryStorage.sessions.get(userId) || []
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId)

    if (sessionIndex === -1) return null

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    }

    // Save to localStorage
    this.saveToLocalStorage()

    // Update analytics and streak
    await this.updateAnalytics(userId)
    await this.updateStudyStreak(userId)

    return sessions[sessionIndex]
  }

  async deleteStudySession(userId: string, sessionId: string): Promise<boolean> {
    const sessions = this.memoryStorage.sessions.get(userId) || []
    const initialLength = sessions.length
    const filteredSessions = sessions.filter((s) => s.id !== sessionId)

    if (filteredSessions.length === initialLength) return false

    this.memoryStorage.sessions.set(userId, filteredSessions)

    // Save to localStorage
    this.saveToLocalStorage()

    // Update analytics and streak
    await this.updateAnalytics(userId)
    await this.updateStudyStreak(userId)

    return true
  }

  // Start a session manually
  async startSession(userId: string, sessionId: string): Promise<StudySession | null> {
    const result = await this.updateStudySession(userId, sessionId, {
      status: "in_progress",
      actual_start_time: this.getCurrentTimestamp(),
    })

    // Update streak when session starts
    await this.updateStudyStreak(userId)
    return result
  }

  // Complete a session manually
  async completeSession(
    userId: string,
    sessionId: string,
    score?: number,
    notes?: string,
  ): Promise<StudySession | null> {
    const session = await this.getStudySession(userId, sessionId)
    if (!session) return null

    const updates: Partial<StudySession> = {
      status: "completed",
      score,
      notes,
    }

    // If session was in progress, calculate actual duration
    if (session.status === "in_progress" && session.actual_start_time) {
      updates.actual_end_time = this.getCurrentTimestamp()
      const actualStart = new Date(session.actual_start_time)
      const actualEnd = new Date(updates.actual_end_time)
      updates.actual_duration_minutes = Math.round((actualEnd.getTime() - actualStart.getTime()) / 60000)
    } else if (!session.actual_duration_minutes) {
      // If no actual duration, use planned duration
      updates.actual_duration_minutes = session.duration_minutes
    }

    const result = await this.updateStudySession(userId, sessionId, updates)

    // Force update streak when session is completed
    await this.updateStudyStreak(userId)

    return result
  }

  // Cancel a session
  async cancelSession(userId: string, sessionId: string): Promise<StudySession | null> {
    return await this.updateStudySession(userId, sessionId, {
      status: "cancelled",
    })
  }

  // Get sessions by date range
  async getSessionsByDateRange(userId: string, startDate: string, endDate: string): Promise<StudySession[]> {
    const sessions = await this.getUserStudySessions(userId)
    return sessions
      .filter((session) => session.date >= startDate && session.date <= endDate)
      .sort((a, b) => new Date(a.date + " " + a.start_time).getTime() - new Date(b.date + " " + b.start_time).getTime())
  }

  // Get upcoming sessions (scheduled or in_progress)
  async getUpcomingSessions(userId: string, limit = 10): Promise<StudySession[]> {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5)

    const sessions = await this.getUserStudySessions(userId)

    return sessions
      .filter((session) => {
        // Include scheduled sessions in the future
        if (session.status === "scheduled") {
          return session.date > currentDate || (session.date === currentDate && session.start_time > currentTime)
        }
        // Include in-progress sessions
        if (session.status === "in_progress") {
          return true
        }
        return false
      })
      .sort((a, b) => new Date(a.date + " " + a.start_time).getTime() - new Date(b.date + " " + b.start_time).getTime())
      .slice(0, limit)
  }

  // Get past sessions (completed, missed, cancelled)
  async getPastSessions(userId: string, limit = 20): Promise<StudySession[]> {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5)

    const sessions = await this.getUserStudySessions(userId)

    return sessions
      .filter((session) => {
        // Include completed, missed, cancelled sessions
        if (["completed", "missed", "cancelled"].includes(session.status)) {
          return true
        }
        // Include scheduled sessions that are in the past
        if (session.status === "scheduled") {
          return session.date < currentDate || (session.date === currentDate && session.end_time < currentTime)
        }
        return false
      })
      .sort((a, b) => new Date(b.date + " " + b.start_time).getTime() - new Date(a.date + " " + a.start_time).getTime())
      .slice(0, limit)
  }

  // Study Plans
  async createStudyPlan(
    userId: string,
    planData: Omit<StudyPlan, "id" | "user_id" | "created_at" | "updated_at">,
  ): Promise<StudyPlan> {
    const plan: StudyPlan = {
      ...planData,
      id: this.generateId(),
      user_id: userId,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    }

    if (!this.memoryStorage.plans.has(userId)) {
      this.memoryStorage.plans.set(userId, [])
    }
    this.memoryStorage.plans.get(userId)!.push(plan)

    this.saveToLocalStorage()
    return plan
  }

  async getUserStudyPlans(userId: string): Promise<StudyPlan[]> {
    return [...(this.memoryStorage.plans.get(userId) || [])]
  }

  // Study Reminders
  async createStudyReminder(
    userId: string,
    reminderData: Omit<StudyReminder, "id" | "user_id" | "created_at">,
  ): Promise<StudyReminder> {
    const reminder: StudyReminder = {
      ...reminderData,
      id: this.generateId(),
      user_id: userId,
      created_at: this.getCurrentTimestamp(),
    }

    if (!this.memoryStorage.reminders.has(userId)) {
      this.memoryStorage.reminders.set(userId, [])
    }
    this.memoryStorage.reminders.get(userId)!.push(reminder)

    this.saveToLocalStorage()

    // Schedule browser notification
    this.scheduleNotification(reminder)

    return reminder
  }

  private scheduleNotification(reminder: StudyReminder): void {
    if (typeof window === "undefined" || !("Notification" in window)) return

    const reminderTime = new Date(reminder.reminder_time)
    const now = new Date()
    const delay = reminderTime.getTime() - now.getTime()

    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Study Reminder", {
            body: reminder.message,
            icon: "/favicon.ico",
          })
        }
      }, delay)
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) return false

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  // Study Goals
  async createStudyGoal(
    userId: string,
    goalData: Omit<StudyGoal, "id" | "user_id" | "created_at" | "updated_at">,
  ): Promise<StudyGoal> {
    const goal: StudyGoal = {
      ...goalData,
      id: this.generateId(),
      user_id: userId,
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    }

    if (!this.memoryStorage.goals.has(userId)) {
      this.memoryStorage.goals.set(userId, [])
    }
    this.memoryStorage.goals.get(userId)!.push(goal)

    this.saveToLocalStorage()
    return goal
  }

  async getUserStudyGoals(userId: string): Promise<StudyGoal[]> {
    return [...(this.memoryStorage.goals.get(userId) || [])]
  }

  // Study Streak - Enhanced calculation
  async updateStudyStreak(userId: string): Promise<StudyStreak> {
    const sessions = await this.getUserStudySessions(userId)
    const completedSessions = sessions.filter((s) => s.status === "completed")

    // Get unique study dates sorted
    const studyDates = [...new Set(completedSessions.map((s) => s.date))].sort()

    let currentStreak = 0
    let longestStreak = 0
    let lastStudyDate = ""

    if (studyDates.length > 0) {
      lastStudyDate = studyDates[studyDates.length - 1]

      // Calculate current streak (consecutive days from most recent backwards)
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]

      // Start from today or last study date, whichever is more recent
      const checkDate = new Date(Math.max(new Date(lastStudyDate).getTime(), today.getTime()))

      // Check if we studied today or yesterday to maintain streak
      const daysSinceLastStudy = Math.floor(
        (today.getTime() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24),
      )

      if (daysSinceLastStudy <= 1) {
        // Calculate consecutive days backwards from last study date
        for (let i = studyDates.length - 1; i >= 0; i--) {
          const currentDate = studyDates[i]
          const expectedDate = new Date(checkDate)
          expectedDate.setDate(expectedDate.getDate() - currentStreak)
          const expectedDateStr = expectedDate.toISOString().split("T")[0]

          if (currentDate === expectedDateStr) {
            currentStreak++
          } else {
            break
          }
        }
      }

      // Calculate longest streak
      let tempStreak = 1
      for (let i = 1; i < studyDates.length; i++) {
        const prevDate = new Date(studyDates[i - 1])
        const currDate = new Date(studyDates[i])
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    const streak: StudyStreak = {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_study_date: lastStudyDate,
      updated_at: this.getCurrentTimestamp(),
    }

    this.memoryStorage.streaks.set(userId, streak)
    this.saveToLocalStorage()

    console.log("Updated streak for user:", userId, streak)
    return streak
  }

  async getUserStudyStreak(userId: string): Promise<StudyStreak> {
    // Always recalculate streak to ensure it's current
    return await this.updateStudyStreak(userId)
  }

  // Analytics - enhanced with real calculations
  async updateAnalytics(userId: string): Promise<StudyAnalytics> {
    const sessions = await this.getUserStudySessions(userId)
    const completedSessions = sessions.filter((s) => s.status === "completed")

    console.log("Updating analytics for user:", userId, "Completed sessions:", completedSessions.length)

    // Calculate total hours (use actual duration if available, otherwise planned duration)
    const totalMinutes = completedSessions.reduce((sum, session) => {
      const duration = session.actual_duration_minutes || session.duration_minutes || 0
      return sum + duration
    }, 0)
    const totalHours = totalMinutes / 60

    // Calculate average score (only from sessions that have scores)
    const sessionsWithScores = completedSessions.filter((s) => s.score !== undefined && s.score !== null && s.score > 0)
    const averageScore =
      sessionsWithScores.length > 0
        ? Math.round(sessionsWithScores.reduce((sum, s) => sum + (s.score || 0), 0) / sessionsWithScores.length)
        : 0

    // Get unique subjects
    const subjectsStudied = [...new Set(sessions.map((s) => s.subject))]

    // Calculate weekly hours (last 7 days)
    const today = new Date()
    const weeklyHours = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = dayNames[date.getDay()]

      const dayMinutes = completedSessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0)

      weeklyHours.push({
        day: dayName,
        hours: Math.round((dayMinutes / 60) * 10) / 10,
        target: 3,
      })
    }

    // Calculate subject progress
    const subjectColors = [
      "bg-green-500",
      "bg-blue-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
    ]
    const subjectProgress = subjectsStudied.map((subject, index) => {
      const subjectSessions = completedSessions.filter((s) => s.subject === subject)
      const subjectMinutes = subjectSessions.reduce(
        (sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0),
        0,
      )
      const subjectHours = subjectMinutes / 60
      const subjectScores = subjectSessions.filter((s) => s.score !== undefined && s.score !== null && s.score > 0)
      const avgScore =
        subjectScores.length > 0
          ? Math.round(subjectScores.reduce((sum, s) => sum + (s.score || 0), 0) / subjectScores.length)
          : 0

      return {
        subject,
        progress: avgScore,
        hours: Math.round(subjectHours * 10) / 10,
        color: subjectColors[index % subjectColors.length],
      }
    })

    // Calculate most productive time
    const hourlyStats: { [hour: number]: number } = {}
    completedSessions.forEach((session) => {
      const hour = Number.parseInt(session.start_time.split(":")[0])
      hourlyStats[hour] = (hourlyStats[hour] || 0) + (session.actual_duration_minutes || session.duration_minutes || 0)
    })

    const mostProductiveHour = Object.entries(hourlyStats).sort(([, a], [, b]) => b - a)[0]?.[0]
    const mostProductiveTime = mostProductiveHour
      ? `${mostProductiveHour.padStart(2, "0")}:00 - ${(Number.parseInt(mostProductiveHour) + 1).toString().padStart(2, "0")}:00`
      : ""

    const strongestSubject = subjectProgress.sort((a, b) => b.progress - a.progress)[0]?.subject || ""
    const improvementArea = subjectProgress.sort((a, b) => a.progress - b.progress)[0]?.subject || ""

    const analytics: StudyAnalytics = {
      user_id: userId,
      total_hours: Math.round(totalHours * 10) / 10,
      total_sessions: completedSessions.length,
      average_score: averageScore,
      subjects_studied: subjectsStudied,
      most_productive_time: mostProductiveTime,
      weekly_hours: weeklyHours,
      subject_progress: subjectProgress,
      insights: {
        most_productive_time: mostProductiveTime,
        strongest_subject: strongestSubject,
        improvement_area: improvementArea,
      },
    }

    this.memoryStorage.analytics.set(userId, analytics)
    this.saveToLocalStorage()

    console.log("Updated analytics:", analytics)
    return analytics
  }

  async getUserAnalytics(userId: string): Promise<StudyAnalytics> {
    // Always recalculate analytics to ensure they're current
    return await this.updateAnalytics(userId)
  }

  // Initialize with sample data for demo purposes
  async initializeSampleData(userId: string): Promise<void> {
    const existingSessions = await this.getUserStudySessions(userId)
    if (existingSessions.length > 0) return // Don't overwrite existing data

    console.log("Initializing sample data for user:", userId)

    const today = new Date()
    const sampleSessions: Omit<StudySession, "id" | "user_id" | "created_at" | "updated_at">[] = [
      {
        title: "Biology Chapter 5 Review",
        subject: "Biology",
        topic: "Cell Division",
        date: today.toISOString().split("T")[0],
        start_time: "14:00",
        end_time: "16:00",
        duration_minutes: 120,
        type: "study",
        priority: "high",
        status: "scheduled",
      },
      {
        title: "Math Practice Quiz",
        subject: "Mathematics",
        topic: "Calculus",
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        start_time: "10:00",
        end_time: "11:30",
        duration_minutes: 90,
        type: "quiz",
        priority: "medium",
        status: "scheduled",
      },
      {
        title: "Chemistry Lab Review",
        subject: "Chemistry",
        topic: "Organic Compounds",
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        start_time: "15:00",
        end_time: "17:00",
        duration_minutes: 120,
        type: "review",
        priority: "high",
        status: "completed",
        score: 92,
        actual_duration_minutes: 115,
      },
      {
        title: "Physics Problem Solving",
        subject: "Physics",
        topic: "Thermodynamics",
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        start_time: "13:00",
        end_time: "15:30",
        duration_minutes: 150,
        type: "practice",
        priority: "medium",
        status: "completed",
        score: 88,
        actual_duration_minutes: 140,
      },
      {
        title: "Spanish Vocabulary",
        subject: "Spanish",
        topic: "Verb Conjugations",
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "10:20",
        duration_minutes: 80,
        type: "study",
        priority: "low",
        status: "completed",
        score: 78,
        actual_duration_minutes: 85,
      },
    ]

    // Create sample sessions
    for (const sessionData of sampleSessions) {
      await this.createStudySession({ id: userId } as User, sessionData)
    }

    // Create sample goals
    const sampleGoals = [
      { subject: "Biology", target_hours_per_week: 8, target_sessions_per_week: 4 },
      { subject: "Mathematics", target_hours_per_week: 6, target_sessions_per_week: 3 },
      { subject: "Chemistry", target_hours_per_week: 7, target_sessions_per_week: 3 },
      { subject: "Physics", target_hours_per_week: 5, target_sessions_per_week: 2 },
    ]

    for (const goalData of sampleGoals) {
      await this.createStudyGoal(userId, goalData)
    }

    console.log("Sample data initialized. Total sessions:", (await this.getUserStudySessions(userId)).length)
  }

  // Utility methods for easy backend migration
  async exportUserData(userId: string): Promise<{
    sessions: StudySession[]
    goals: StudyGoal[]
    streak: StudyStreak
    analytics: StudyAnalytics
    plans: StudyPlan[]
    reminders: StudyReminder[]
  }> {
    return {
      sessions: await this.getUserStudySessions(userId),
      goals: await this.getUserStudyGoals(userId),
      streak: await this.getUserStudyStreak(userId),
      analytics: await this.getUserAnalytics(userId),
      plans: await this.getUserStudyPlans(userId),
      reminders: this.memoryStorage.reminders.get(userId) || [],
    }
  }
}

export const studyCalendarService = new StudyCalendarService()
