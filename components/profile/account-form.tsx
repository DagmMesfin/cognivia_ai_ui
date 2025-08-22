"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    mobile: false,
  })
  const [language, setLanguage] = useState("english")
  const [theme, setTheme] = useState("light")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // In a real app, we would update the account in the database here
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about your account via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange("email")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
              </div>
              <Switch
                id="browser-notifications"
                checked={notifications.browser}
                onCheckedChange={() => handleNotificationChange("browser")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications on your mobile device</p>
              </div>
              <Switch
                id="mobile-notifications"
                checked={notifications.mobile}
                onCheckedChange={() => handleNotificationChange("mobile")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              Reset to Defaults
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your content. This action cannot be undone.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" type="button">
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
