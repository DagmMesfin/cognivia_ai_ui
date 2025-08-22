"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { Loader2, Upload } from "lucide-react"

export function AccountSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation password must match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information and email address.</CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
                <AvatarFallback className="text-lg">{formData.name ? getInitials(formData.name) : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Change avatar
                </Button>
                <p className="text-sm text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to maintain account security.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
