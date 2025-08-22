"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/profile/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountForm } from "@/components/profile/account-form"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileActivity } from "@/components/profile/profile-activity"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { User, Settings, Activity, BarChart3, Trophy, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  const getInitials = () => {
    if (!user) return "U"
    const nameParts = user.name.split(" ")
    return nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getJoinedDate = () => {
    if (!user) return "Unknown"
    return new Date(user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl blur-xl"></div>
          <Card className="relative border-0 bg-background/80 dark:bg-background/80 backdrop-blur-sm shadow-xl dark:shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-background dark:ring-background shadow-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {user.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="w-fit bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Active Learner
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {getJoinedDate()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>ID: {user.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 dark:bg-muted/30 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview" className="space-y-6">
              <ProfileStats userId={user.id} />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <ProfileActivity userId={user.id} />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <ProfileStats userId={user.id} detailed={true} />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <AccountForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
