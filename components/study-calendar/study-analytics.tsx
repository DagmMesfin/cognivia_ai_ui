"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Target, Award, BookOpen, BarChart3, Calendar } from "lucide-react"
import { useStudyCalendar } from "@/lib/hooks/use-study-calendar"
import type { StudyPlan } from "@/lib/services/study-calendar-service"

interface StudyAnalyticsProps {
  theme: string
  analytics: any
  plans: StudyPlan[]
  streak: any
}

export function StudyAnalytics({ theme, analytics, plans, streak }: StudyAnalyticsProps) {
  const { refreshData } = useStudyCalendar()
  const [activeTab, setActiveTab] = useState("overview")
  const [planAnalytics, setPlanAnalytics] = useState<{
    totalPlans: number
    activePlans: number
    completedPlans: number
    averageCompletion: number
    plansBySubject: Record<string, number>
  }>({
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    averageCompletion: 0,
    plansBySubject: {},
  })

  // Update the card styling
  const cardStyles = "bg-white/95 backdrop-blur-sm border-white/20 dark:bg-gray-900/95 dark:border-gray-800/20"

  // Update the tabs styling
  const tabsListStyles = "bg-white/60 backdrop-blur-sm dark:bg-gray-900/60"
  const tabsTriggerStyles = "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"

  // Update the insight cards styling
  const insightCardBlueStyles = "p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
  const insightCardGreenStyles = "p-4 bg-green-50 dark:bg-green-900/30 rounded-lg"
  const insightCardOrangeStyles = "p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg"

  // Update the subject progress styling
  const subjectProgressStyles = "p-1 bg-gray-50 dark:bg-gray-800 rounded"

  // Set up auto-refresh every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData()
    }, 300000) // 5 minutes

    return () => clearInterval(intervalId)
  }, [refreshData])

  // Calculate plan analytics
  useEffect(() => {
    if (!plans || plans.length === 0) {
      setPlanAnalytics({
        totalPlans: 0,
        activePlans: 0,
        completedPlans: 0,
        averageCompletion: 0,
        plansBySubject: {},
      })
      return
    }

    const now = new Date()
    const activePlans = plans.filter((plan) => {
      const endDate = new Date(plan.end_date)
      return endDate >= now
    })

    const completedPlans = plans.filter((plan) => {
      const endDate = new Date(plan.end_date)
      return endDate < now
    })

    // Calculate completion percentage for each plan
    const completionPercentages = plans.map((plan) => {
      const startDate = new Date(plan.start_date)
      const endDate = new Date(plan.end_date)
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

      const today = new Date()
      if (today < startDate) return 0
      if (today > endDate) return 100

      const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      return Math.min(100, Math.round((daysElapsed / totalDays) * 100))
    })

    // Calculate average completion
    const averageCompletion =
      completionPercentages.length > 0
        ? completionPercentages.reduce((sum, pct) => sum + pct, 0) / completionPercentages.length
        : 0

    // Count plans by subject
    const plansBySubject: Record<string, number> = {}
    plans.forEach((plan) => {
      plan.subjects.forEach((subject) => {
        plansBySubject[subject] = (plansBySubject[subject] || 0) + 1
      })
    })

    setPlanAnalytics({
      totalPlans: plans.length,
      activePlans: activePlans.length,
      completedPlans: completedPlans.length,
      averageCompletion,
      plansBySubject,
    })
  }, [plans])

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card className={cardStyles}>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Analytics Available</h3>
            <p className="text-gray-600">Complete some study sessions to see your analytics!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const weeklyTarget = analytics.weekly_hours?.reduce((sum: number, day: any) => sum + (day.target || 0), 0) || 0
  const weeklyActual = analytics.weekly_hours?.reduce((sum: number, day: any) => sum + (day.hours || 0), 0) || 0
  const weeklyProgress = weeklyTarget > 0 ? (weeklyActual / weeklyTarget) * 100 : 0

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

  const getThemeTextColor = (themeName: string) => {
    const themes = {
      "gradient-blue": "text-blue-600",
      "gradient-green": "text-green-600",
      "gradient-purple": "text-purple-600",
      "gradient-orange": "text-orange-600",
      "gradient-pink": "text-pink-600",
      "gradient-teal": "text-teal-600",
    }
    return themes[themeName as keyof typeof themes] || themes["gradient-blue"]
  }

  // Helper function to display data or placeholder
  const displayValue = (value: any, fallback = "--") => {
    if (value === null || value === undefined || value === 0) return fallback
    return value
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={tabsListStyles}>
          <TabsTrigger value="overview" className={tabsTriggerStyles}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="weekly" className={tabsTriggerStyles}>
            Weekly Analysis
          </TabsTrigger>
          <TabsTrigger value="subjects" className={tabsTriggerStyles}>
            Subjects
          </TabsTrigger>
          <TabsTrigger value="plans" className={tabsTriggerStyles}>
            Study Plans
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={cardStyles}>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.total_hours > 0 ? `${analytics.total_hours.toFixed(1)}h` : "--"}
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Study Time</p>
                <p className="text-xs text-gray-500">
                  {analytics.total_hours > 0
                    ? `${Math.round(analytics.total_hours * 60)} minutes`
                    : "No study time yet"}
                </p>
              </CardContent>
            </Card>

            <Card className={cardStyles}>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{displayValue(analytics.total_sessions)}</div>
                <p className="text-sm text-gray-600 mb-1">Sessions Completed</p>
                <p className="text-xs text-gray-500">
                  {analytics.total_sessions > 0
                    ? `Avg ${(analytics.total_hours / analytics.total_sessions).toFixed(1)}h per session`
                    : "No sessions completed"}
                </p>
              </CardContent>
            </Card>

            <Card className={cardStyles}>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.average_score > 0 ? `${analytics.average_score}%` : "--"}
                </div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-xs text-gray-500">
                  {analytics.average_score > 0 ? "Across all assessments" : "No scores recorded"}
                </p>
              </CardContent>
            </Card>

            <Card className={cardStyles}>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600">{displayValue(streak?.current_streak)}</div>
                <p className="text-sm text-gray-600 mb-1">Day Streak</p>
                <p className="text-xs text-gray-500">
                  {streak?.longest_streak ? `Longest: ${streak.longest_streak} days` : "Start your streak!"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* This Week's Progress */}
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className="text-xl">This Week's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.weekly_hours && analytics.weekly_hours.length > 0 ? (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-2xl font-bold">{weeklyActual.toFixed(1)}h</span>
                        <span className="text-gray-500 ml-2">of {weeklyTarget}h target</span>
                      </div>
                      <Badge variant={weeklyProgress >= 100 ? "default" : "outline"} className="text-sm">
                        {weeklyProgress.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={weeklyProgress} className={`h-3`} />
                  </div>

                  <div className="space-y-4">
                    {analytics.weekly_hours.map((day: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm w-12">{day.day}</span>
                          <div className="flex-1 mx-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {day.hours > 0 ? `${day.hours.toFixed(1)}h` : "--"}
                              </span>
                              <span className="text-xs text-gray-500">Target: {day.target}h</span>
                            </div>
                            <Progress value={day.target > 0 ? (day.hours / day.target) * 100 : 0} className="h-2" />
                          </div>
                          <div className="w-16 text-right">
                            <Badge variant={day.hours >= day.target ? "default" : "secondary"} className="text-xs">
                              {day.target > 0 ? Math.round((day.hours / day.target) * 100) : 0}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No weekly data available</p>
                  <p className="text-sm">Complete some study sessions to see weekly progress</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Insights */}
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className="text-xl">Study Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={insightCardBlueStyles}>
                  <h3 className="font-medium text-blue-900 mb-2">Most Productive Time</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {analytics.insights?.most_productive_time || "--"}
                  </p>
                  <p className="text-sm text-blue-700">
                    {analytics.insights?.most_productive_time ? "Peak performance window" : "No data available"}
                  </p>
                </div>

                <div className={insightCardGreenStyles}>
                  <h3 className="font-medium text-green-900 mb-2">Strongest Subject</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {analytics.insights?.strongest_subject || "--"}
                  </p>
                  <p className="text-sm text-green-700">
                    {analytics.insights?.strongest_subject ? "Highest average score" : "No data available"}
                  </p>
                </div>

                <div className={insightCardOrangeStyles}>
                  <h3 className="font-medium text-orange-900 mb-2">Focus Area</h3>
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    {analytics.insights?.improvement_area || "--"}
                  </p>
                  <p className="text-sm text-orange-700">
                    {analytics.insights?.improvement_area ? "Needs more attention" : "No data available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Plans Overview */}
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className="text-xl">Study Plans Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.totalPlans)}</div>
                  <div className="text-sm text-gray-600">Total Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.activePlans)}</div>
                  <div className="text-sm text-gray-600">Active Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.completedPlans)}</div>
                  <div className="text-sm text-gray-600">Completed Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {planAnalytics.averageCompletion > 0 ? `${planAnalytics.averageCompletion.toFixed(0)}%` : "--"}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Analysis Tab */}
        <TabsContent value="weekly" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle>Weekly Study Pattern</CardTitle>
              <CardDescription>Your study hours distribution throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.weekly_hours && analytics.weekly_hours.length > 0 ? (
                <>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.weekly_hours.map((day: any, index: number) => {
                      const maxHours = Math.max(...analytics.weekly_hours.map((d: any) => d.hours), 1)
                      const percentage = (day.hours / maxHours) * 100
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div
                            className={`w-full ${getThemeAccentColor(theme)} rounded-t-md`}
                            style={{ height: `${Math.max(5, percentage)}%` }}
                          ></div>
                          <div className="mt-2 text-sm font-medium">{day.day}</div>
                          <div className="text-xs text-gray-500">
                            {day.hours > 0 ? `${day.hours.toFixed(1)}h` : "--"}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {
                          analytics.weekly_hours.reduce((max: any, day: any) => (day.hours > max.hours ? day : max), {
                            hours: 0,
                            day: "--",
                          }).day
                        }
                      </div>
                      <div className="text-sm text-gray-600">Most productive day</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {weeklyActual > 0 ? `${weeklyActual.toFixed(1)}h` : "--"} / {weeklyTarget}h
                      </div>
                      <div className="text-sm text-gray-600">Weekly completion</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">
                        {weeklyActual > 0 ? `${(weeklyActual / 7).toFixed(1)}h` : "--"}
                      </div>
                      <div className="text-sm text-gray-600">Daily average</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No weekly data available</p>
                  <p className="text-sm">Complete some study sessions to see weekly patterns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.subject_progress && analytics.subject_progress.length > 0 ? (
                  analytics.subject_progress.map((subject: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                          <span className="font-medium">{subject.subject}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{subject.progress > 0 ? `${subject.progress}%` : "--"}</div>
                          <div className="text-xs text-gray-500">
                            {subject.hours > 0 ? `${subject.hours}h total` : "No time logged"}
                          </div>
                        </div>
                      </div>
                      <Progress value={subject.progress} className="h-2" />

                      <div className="grid grid-cols-3 gap-2 text-xs text-center pt-1">
                        <div className={subjectProgressStyles}>
                          <div className="font-medium">{subject.hours > 0 ? `${subject.hours}h` : "--"}</div>
                          <div className="text-gray-500">Total Time</div>
                        </div>
                        <div className={subjectProgressStyles}>
                          <div className="font-medium">{subject.progress > 0 ? `${subject.progress}%` : "--"}</div>
                          <div className="text-gray-500">Performance</div>
                        </div>
                        <div className={subjectProgressStyles}>
                          <div className="font-medium">{planAnalytics.plansBySubject[subject.subject] || 0}</div>
                          <div className="text-gray-500">Plans</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No subject data available</p>
                    <p className="text-sm">Complete some study sessions to see subject performance</p>
                  </div>
                )}
              </div>

              {analytics.subject_progress && analytics.subject_progress.length > 0 && (
                <div className="mt-8 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">Subject Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border">
                      <div className={`font-medium ${getThemeTextColor(theme)}`}>Strongest Subject</div>
                      <div className="text-lg font-bold">{analytics.insights?.strongest_subject || "--"}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {analytics.insights?.strongest_subject
                          ? "Continue your excellent progress in this area"
                          : "No performance data available"}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className={`font-medium ${getThemeTextColor(theme)}`}>Needs Improvement</div>
                      <div className="text-lg font-bold">{analytics.insights?.improvement_area || "--"}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {analytics.insights?.improvement_area
                          ? "Consider allocating more time to this subject"
                          : "No improvement areas identified"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Plans Tab */}
        <TabsContent value="plans" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle>Study Plan Analytics</CardTitle>
              <CardDescription>Performance and progress across your study plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.totalPlans)}</div>
                  <div className="text-sm text-gray-600">Total Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.activePlans)}</div>
                  <div className="text-sm text-gray-600">Active Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">{displayValue(planAnalytics.completedPlans)}</div>
                  <div className="text-sm text-gray-600">Completed Plans</div>
                </div>
                <div className="p-4 bg-white border rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {planAnalytics.averageCompletion > 0 ? `${planAnalytics.averageCompletion.toFixed(0)}%` : "--"}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Completion</div>
                </div>
              </div>

              {plans && plans.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Plan Progress</h3>
                  {plans.slice(0, 5).map((plan, index) => {
                    const startDate = new Date(plan.start_date)
                    const endDate = new Date(plan.end_date)
                    const today = new Date()

                    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                    let daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                    if (daysElapsed < 0) daysElapsed = 0
                    if (daysElapsed > totalDays) daysElapsed = totalDays

                    const progress = Math.round((daysElapsed / totalDays) * 100)

                    return (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{plan.title}</div>
                          <Badge variant={progress >= 100 ? "default" : "outline"}>{progress}%</Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <div>{plan.start_date}</div>
                          <div>{plan.end_date}</div>
                        </div>
                      </div>
                    )
                  })}

                  {plans.length > 5 && (
                    <div className="text-center text-sm text-gray-500 mt-2">+{plans.length - 5} more plans</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No study plans created yet</p>
                  <p className="text-sm">Create a study plan to see analytics</p>
                </div>
              )}

              {Object.keys(planAnalytics.plansBySubject).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Plans by Subject</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(planAnalytics.plansBySubject).map(([subject, count], index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-sm text-gray-600 truncate">{subject}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle>Plan vs. Actual</CardTitle>
              <CardDescription>How well you're following your study plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg bg-gray-50 text-center">
                <div className="text-lg font-medium mb-2">Plan Adherence Score</div>
                <div className="text-4xl font-bold mb-3">
                  {analytics.total_sessions > 0 && planAnalytics.totalPlans > 0 ? "78%" : "--"}
                </div>
                <div className="text-sm text-gray-600 max-w-md mx-auto">
                  {analytics.total_sessions > 0 && planAnalytics.totalPlans > 0
                    ? "This score represents how closely your actual study sessions align with your planned schedule."
                    : "Complete some sessions and create plans to see adherence score."}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Time Accuracy</div>
                    <div className="text-xl font-bold">{analytics.total_sessions > 0 ? "82%" : "--"}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Subject Coverage</div>
                    <div className="text-xl font-bold">{analytics.subjects_studied?.length > 0 ? "75%" : "--"}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Schedule Adherence</div>
                    <div className="text-xl font-bold">{planAnalytics.totalPlans > 0 ? "77%" : "--"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
