"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/use-auth"

export function ProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  })

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ")
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email,
        bio: "Computer Science student at University of Technology. Interested in AI, machine learning, and software development.",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, we would update the profile in the database here
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // You could call authAPI.updateUser here when that endpoint is available
      console.log("Profile updated:", formData)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    if (!user) return "U"
    const nameParts = user.name.split(" ")
    return nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading user information...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and how others see you on the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange} />
              <p className="text-xs text-muted-foreground">
                Brief description about yourself. This will be visible to other students if you share your notebooks.
              </p>
            </div>

            {/* Display user metadata */}
            <div className="grid gap-2">
              <Label>Account Information</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}
