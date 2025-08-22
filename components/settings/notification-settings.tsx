"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    studyReminders: true,
    sessionAlerts: true,
    weeklyDigest: true,
    achievementNotifications: true,
    marketingEmails: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure which emails you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Study reminders</span>
              <span className="text-sm font-normal text-muted-foreground">
                Receive reminders about upcoming study sessions
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.studyReminders}
              onCheckedChange={() => handleToggle("studyReminders")}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="session-alerts" className="flex flex-col space-y-1">
              <span>Session alerts</span>
              <span className="text-sm font-normal text-muted-foreground">
                Get notified when it's time for your scheduled study sessions
              </span>
            </Label>
            <Switch
              id="session-alerts"
              checked={settings.sessionAlerts}
              onCheckedChange={() => handleToggle("sessionAlerts")}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="weekly-digest" className="flex flex-col space-y-1">
              <span>Weekly digest</span>
              <span className="text-sm font-normal text-muted-foreground">
                Receive a weekly summary of your study progress
              </span>
            </Label>
            <Switch
              id="weekly-digest"
              checked={settings.weeklyDigest}
              onCheckedChange={() => handleToggle("weeklyDigest")}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="achievement-notifications" className="flex flex-col space-y-1">
              <span>Achievement notifications</span>
              <span className="text-sm font-normal text-muted-foreground">
                Get notified when you earn badges or reach milestones
              </span>
            </Label>
            <Switch
              id="achievement-notifications"
              checked={settings.achievementNotifications}
              onCheckedChange={() => handleToggle("achievementNotifications")}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
              <span>Marketing emails</span>
              <span className="text-sm font-normal text-muted-foreground">
                Receive updates about new features and promotions
              </span>
            </Label>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
