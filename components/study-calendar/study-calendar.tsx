"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "./calendar-view"
import { UpcomingSessions } from "./upcoming-sessions"
import { PastSessions } from "./past-sessions"
import { StudyAnalytics } from "./study-analytics"
import { QuickActions } from "./quick-actions"
import { CreateSessionDialog } from "./create-session-dialog"
import { StudyPlanDialog } from "./study-plan-dialog"
import { StudyPlansList } from "./study-plans-list"
import { ReminderDialog } from "./reminder-dialog"
import { StudyStreakView } from "./study-streak-view"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import { Card } from "@/components/ui/card"
import { useThemeSettings } from "@/lib/hooks/use-theme-settings"

export function StudyCalendar() {
  const [activeTab, setActiveTab] = useState("calendar")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)

  const { settings } = useThemeSettings()

  const {
    sessions,
    upcomingSessions,
    pastSessions,
    analytics,
    streak,
    plans,
    isLoading,
    error,
    createSession,
    createStudyPlan,
    createReminder,
    refreshData,
  } = useStudyCalendar()

  // Auto-refresh data every 2 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData()
    }, 120000) // 2 minutes

    return () => clearInterval(intervalId)
  }, [refreshData])

  const handleViewProgress = () => {
    setActiveTab("analytics")
  }

  const handleScheduleSession = () => {
    setShowCreateDialog(true)
  }

  const handleCreateStudyPlan = () => {
    setShowPlanDialog(true)
  }

  const handleSetReminder = () => {
    setShowReminderDialog(true)
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      await createSession(sessionData)
      setShowCreateDialog(false)
      return sessionData // Return the created session data
    } catch (error) {
      console.error("Failed to create session:", error)
      throw error
    }
  }

  const handleCreatePlan = async (planData: any) => {
    try {
      await createStudyPlan(planData)
      setShowPlanDialog(false)
      return planData
    } catch (error) {
      console.error("Failed to create study plan:", error)
      throw error
    }
  }

  const handleCreateReminder = async (reminderData: any) => {
    try {
      await createReminder(reminderData)
      setShowReminderDialog(false)
      return reminderData
    } catch (error) {
      console.error("Failed to create reminder:", error)
      throw error
    }
  }

  // Update the getThemeClasses function to support dark mode
  const getThemeClasses = (themeName: string) => {
    const themes = {
      "gradient-blue":
        "from-blue-50 via-blue-100 to-indigo-200 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950",
      "gradient-green":
        "from-green-50 via-emerald-100 to-teal-200 dark:from-green-950 dark:via-emerald-900 dark:to-teal-950",
      "gradient-purple":
        "from-purple-50 via-violet-100 to-purple-200 dark:from-purple-950 dark:via-violet-900 dark:to-purple-950",
      "gradient-orange":
        "from-orange-50 via-amber-100 to-red-200 dark:from-orange-950 dark:via-amber-900 dark:to-red-950",
      "gradient-pink": "from-pink-50 via-rose-100 to-pink-200 dark:from-pink-950 dark:via-rose-900 dark:to-pink-950",
      "gradient-teal": "from-teal-50 via-cyan-100 to-blue-200 dark:from-teal-950 dark:via-cyan-900 dark:to-blue-950",
    }
    return themes[themeName as keyof typeof themes] || themes["gradient-blue"]
  }

  const getThemeAccentColor = (themeName: string) => {
    const themes = {
      "gradient-blue": "bg-blue-500",
      "gradient-green": "bg-green-500",
      "gradient-purple": "bg-purple-500",
      "gradient-orange": "bg-orange-500",
      "gradient-pink": "bg-pink-500",
      "gradient-teal": "bg-teal-500",
    }
    return themes[themeName as keyof typeof themes] || themes["gradient-blue"]
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading study calendar: {error}</p>
        <button onClick={refreshData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    )
  }

  // Update the card styling
  const cardStyles = "bg-white/95 backdrop-blur-sm border-white/20 dark:bg-gray-900/95 dark:border-gray-800/20"

  // Update the TabsList styling
  const tabsListStyles = "bg-white/60 backdrop-blur-sm dark:bg-gray-900/60"
  const tabsTriggerStyles = "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"

  return (
    <div className={`space-y-6 bg-gradient-to-br ${getThemeClasses(settings.style)} p-4 rounded-lg min-h-screen`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Calendar</h1>
          <p className="text-muted-foreground">Plan, track, and optimize your study sessions</p>
        </div>
      </div>
      {/* Stats Overview */}
      {analytics && streak && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${cardStyles} p-4`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analytics.total_hours.toFixed(1)}h</div>
              <p className="text-sm text-gray-600 font-medium">Total Study Time</p>
            </div>
          </Card>
          <Card className={`${cardStyles} p-4`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.total_sessions}</div>
              <p className="text-sm text-gray-600 font-medium">Sessions Completed</p>
            </div>
          </Card>
          <Card className={`${cardStyles} p-4`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{analytics.average_score}%</div>
              <p className="text-sm text-gray-600 font-medium">Average Score</p>
            </div>
          </Card>
          <Card className={`${cardStyles} p-4`}>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{streak?.current_streak || 0}</div>
              <p className="text-sm text-gray-600 font-medium">Day Streak</p>
            </div>
          </Card>
        </div>
      )}
      <QuickActions
        onViewProgress={handleViewProgress}
        onScheduleSession={handleScheduleSession}
        onCreateStudyPlan={handleCreateStudyPlan}
        onSetReminder={handleSetReminder}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid grid-cols-4 w-full md:w-[500px] ${tabsListStyles}`}>
          <TabsTrigger value="calendar" className={tabsTriggerStyles}>
            Calendar
          </TabsTrigger>
          <TabsTrigger value="sessions" className={tabsTriggerStyles}>
            Sessions
          </TabsTrigger>
          <TabsTrigger value="analytics" className={tabsTriggerStyles}>
            Analytics
          </TabsTrigger>
          <TabsTrigger value="streak" className={tabsTriggerStyles}>
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6 animate-in fade-in-50 duration-300">
          <CalendarView sessions={sessions || []} plans={plans || []} />
          <StudyPlansList plans={plans || []} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6 animate-in fade-in-50 duration-300">
          <UpcomingSessions />
          <PastSessions />
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in-50 duration-300">
          <StudyAnalytics analytics={analytics} plans={plans || []} />
        </TabsContent>

        <TabsContent value="streak" className="animate-in fade-in-50 duration-300">
          <StudyStreakView streak={streak} sessions={sessions || []} />
        </TabsContent>
      </Tabs>
      {/* Dialogs */}
      <CreateSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSession={handleCreateSession}
      />
      <StudyPlanDialog open={showPlanDialog} onOpenChange={setShowPlanDialog} onCreatePlan={handleCreatePlan} />
      <ReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        onCreateReminder={handleCreateReminder}
        sessions={sessions || []}
      />
    </div>
  )
}
