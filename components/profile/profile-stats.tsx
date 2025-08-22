"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import { useNotebooks } from "@/lib/hooks/use-notebooks"
import { Clock, BookOpen, Target, TrendingUp, Calendar, Award, Brain, Zap, BarChart3 } from "lucide-react"

interface ProfileStatsProps {
  userId: string
  detailed?: boolean
}

export function ProfileStats({ userId, detailed = false }: ProfileStatsProps) {
  const {
    sessions,
    plans,
    getUserAnalytics,
    getUserStudyStreak,
    isLoading,
    analytics: hookAnalytics,
    streak: hookStreak,
  } = useStudyCalendar()

  const { notebooks } = useNotebooks()
  const [analytics, setAnalytics] = useState<any>(null)
  const [streak, setStreak] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (getUserAnalytics && getUserStudyStreak) {
          const [analyticsData, streakData] = await Promise.all([getUserAnalytics(), getUserStudyStreak()])
          setAnalytics(analyticsData)
          setStreak(streakData)
        } else {
          // Fallback to hook data if functions aren't available
          setAnalytics(hookAnalytics)
          setStreak(hookStreak)
        }
      } catch (error) {
        console.error("Error loading profile stats:", error)
        // Fallback to hook data on error
        setAnalytics(hookAnalytics)
        setStreak(hookStreak)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId, sessions, plans, getUserAnalytics, getUserStudyStreak, hookAnalytics, hookStreak])

  const displayValue = (value: any, suffix = "") => {
    if (value === null || value === undefined || value === 0) return "--"
    return `${value}${suffix}`
  }

  const formatTime = (hours: number) => {
    if (!hours || hours === 0) return "--"
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes}m`
    }
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    if (minutes === 0) return `${wholeHours}h`
    return `${wholeHours}h ${minutes}m`
  }

  const getCompletionRate = () => {
    if (!sessions || sessions.length === 0) return 0
    const completed = sessions.filter((s) => s.status === "completed").length
    return Math.round((completed / sessions.length) * 100)
  }

  const getActiveSubjects = () => {
    if (!sessions || sessions.length === 0) return []
    const subjects = [...new Set(sessions.map((s) => s.subject).filter(Boolean))]
    return subjects.slice(0, 5) // Top 5 subjects
  }

  const getStudyLevel = () => {
    const totalHours = analytics?.total_hours || 0
    if (totalHours >= 100) return { level: "Expert", color: "bg-purple-500", progress: 100 }
    if (totalHours >= 50) return { level: "Advanced", color: "bg-blue-500", progress: (totalHours / 100) * 100 }
    if (totalHours >= 20) return { level: "Intermediate", color: "bg-green-500", progress: (totalHours / 50) * 100 }
    if (totalHours >= 5) return { level: "Beginner", color: "bg-yellow-500", progress: (totalHours / 20) * 100 }
    return { level: "Starter", color: "bg-gray-500", progress: (totalHours / 5) * 100 }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const studyLevel = getStudyLevel()
  const completionRate = getCompletionRate()
  const activeSubjects = getActiveSubjects()

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Study Time</p>
                <p className="text-3xl font-bold text-blue-900">{formatTime(analytics?.total_hours || 0)}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Sessions Completed</p>
                <p className="text-3xl font-bold text-green-900">{displayValue(analytics?.total_sessions)}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-purple-900">
                  {analytics?.average_score ? `${analytics.average_score}%` : "--"}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-orange-900">
                  {displayValue(streak?.current_streak)} {streak?.current_streak ? "days" : ""}
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats (only shown when detailed=true) */}
      {detailed && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                Study Level Progress
              </CardTitle>
              <CardDescription>Your learning journey progression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{studyLevel.level}</span>
                <Badge className={`${studyLevel.color} text-white`}>
                  {Math.floor(analytics?.total_hours || 0)}h total
                </Badge>
              </div>
              <Progress value={studyLevel.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {studyLevel.level === "Expert"
                  ? "You've mastered the art of studying!"
                  : `${Math.ceil((studyLevel.level === "Advanced" ? 100 : studyLevel.level === "Intermediate" ? 50 : studyLevel.level === "Beginner" ? 20 : 5) - (analytics?.total_hours || 0))} more hours to reach the next level`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                Completion Rate
              </CardTitle>
              <CardDescription>Session completion statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Completion</span>
                <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-semibold">{sessions?.filter((s) => s.status === "completed").length || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Sessions</p>
                  <p className="font-semibold">{sessions?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Active Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeSubjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                    {subject}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No subjects yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Study Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Plans</span>
                <span className="font-semibold">{plans?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Notebooks</span>
                <span className="font-semibold">{notebooks?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Longest Streak</span>
                <span className="font-semibold">
                  {displayValue(streak?.longest_streak)} {streak?.longest_streak ? "days" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Study Date</span>
                <span className="font-semibold">
                  {streak?.last_study_date ? new Date(streak.last_study_date).toLocaleDateString() : "--"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
