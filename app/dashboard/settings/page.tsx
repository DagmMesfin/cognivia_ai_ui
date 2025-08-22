"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function SettingsPage() {
  const router = useRouter()

  return (
    <DashboardShell>
      <div className="container py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="theme">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            <ThemeSettings />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
