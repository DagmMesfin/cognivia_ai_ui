"use client"

import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor, Check } from "lucide-react"

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings, mounted } = useThemeSettings()
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Mode</CardTitle>
          <CardDescription>Choose your preferred color theme for the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="flex flex-col items-center justify-center gap-2 h-auto p-4 relative"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-6 w-6" />
              <span>Light</span>
              {theme === "light" && <Check className="absolute top-2 right-2 h-4 w-4" />}
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="flex flex-col items-center justify-center gap-2 h-auto p-4 relative"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-6 w-6" />
              <span>Dark</span>
              {theme === "dark" && <Check className="absolute top-2 right-2 h-4 w-4" />}
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="flex flex-col items-center justify-center gap-2 h-auto p-4 relative"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-6 w-6" />
              <span>System</span>
              {theme === "system" && <Check className="absolute top-2 right-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Style</CardTitle>
          <CardDescription>Choose a visual style for your interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.style}
            onValueChange={(value) => updateSettings({ style: value as any })}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="default" id="style-default" className="peer sr-only" />
              <Label
                htmlFor="style-default"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2"></div>
                <span className="font-semibold">Default</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-blue" id="style-blue" className="peer sr-only" />
              <Label
                htmlFor="style-blue"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-blue-200 to-indigo-300 dark:from-blue-800 dark:to-indigo-900 rounded mb-2"></div>
                <span className="font-semibold">Blue Gradient</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-green" id="style-green" className="peer sr-only" />
              <Label
                htmlFor="style-green"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-900 rounded mb-2"></div>
                <span className="font-semibold">Green Gradient</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-purple" id="style-purple" className="peer sr-only" />
              <Label
                htmlFor="style-purple"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-purple-200 to-violet-300 dark:from-purple-800 dark:to-violet-900 rounded mb-2"></div>
                <span className="font-semibold">Purple Gradient</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-orange" id="style-orange" className="peer sr-only" />
              <Label
                htmlFor="style-orange"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-orange-200 to-red-300 dark:from-orange-800 dark:to-red-900 rounded mb-2"></div>
                <span className="font-semibold">Orange Gradient</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-pink" id="style-pink" className="peer sr-only" />
              <Label
                htmlFor="style-pink"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-pink-200 to-rose-300 dark:from-pink-800 dark:to-rose-900 rounded mb-2"></div>
                <span className="font-semibold">Pink Gradient</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gradient-teal" id="style-teal" className="peer sr-only" />
              <Label
                htmlFor="style-teal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-full h-8 bg-gradient-to-r from-teal-200 to-cyan-300 dark:from-teal-800 dark:to-cyan-900 rounded mb-2"></div>
                <span className="font-semibold">Teal Gradient</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Choose your preferred accent color for buttons and interactive elements.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.accent}
            onValueChange={(value) => updateSettings({ accent: value as any })}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="blue" id="blue" className="peer sr-only" />
              <Label
                htmlFor="blue"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-blue-500 p-4 hover:bg-blue-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Blue</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="green" id="green" className="peer sr-only" />
              <Label
                htmlFor="green"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-green-500 p-4 hover:bg-green-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Green</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="purple" id="purple" className="peer sr-only" />
              <Label
                htmlFor="purple"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-purple-500 p-4 hover:bg-purple-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Purple</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="orange" id="orange" className="peer sr-only" />
              <Label
                htmlFor="orange"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-orange-500 p-4 hover:bg-orange-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Orange</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="pink" id="pink" className="peer sr-only" />
              <Label
                htmlFor="pink"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-pink-500 p-4 hover:bg-pink-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Pink</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="teal" id="teal" className="peer sr-only" />
              <Label
                htmlFor="teal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-teal-500 p-4 hover:bg-teal-600 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="text-white font-semibold">Teal</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
          <CardDescription>Adjust the roundness of UI elements like buttons and cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.radius}
            onValueChange={(value) => updateSettings({ radius: value as any })}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="subtle" id="subtle" className="peer sr-only" />
              <Label
                htmlFor="subtle"
                className="flex flex-col items-center justify-between rounded-sm border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">Subtle</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="default" id="default" className="peer sr-only" />
              <Label
                htmlFor="default"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">Default</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="rounded" id="rounded" className="peer sr-only" />
              <Label
                htmlFor="rounded"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">Rounded</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animation</CardTitle>
          <CardDescription>Control the amount of animation throughout the interface.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.animation}
            onValueChange={(value) => updateSettings({ animation: value as any })}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
              <Label
                htmlFor="normal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">Normal</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="reduced" id="reduced" className="peer sr-only" />
              <Label
                htmlFor="reduced"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">Reduced</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="none" id="none" className="peer sr-only" />
              <Label
                htmlFor="none"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <span className="font-semibold">None</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
