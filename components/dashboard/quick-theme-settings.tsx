"use client"

import { useState } from "react"
import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Palette, Settings } from "lucide-react"
import Link from "next/link"

export function QuickThemeSettings() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useThemeSettings()

  const accentColors = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" },
    { name: "Pink", value: "pink", color: "bg-pink-500" },
    { name: "Teal", value: "teal", color: "bg-teal-500" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Quick Theme Settings
          </DialogTitle>
          <DialogDescription>Customize your dashboard appearance</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Theme Mode */}
          <div>
            <h4 className="text-sm font-medium mb-2">Theme Mode</h4>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center gap-1"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center gap-1"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex items-center gap-1"
              >
                <Monitor className="h-4 w-4" />
                Auto
              </Button>
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Accent Color</h4>
            <div className="grid grid-cols-2 gap-2">
              {accentColors.map((color) => (
                <Button
                  key={color.value}
                  variant={settings.accent === color.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ accent: color.value as any })}
                  className="flex items-center gap-2 justify-start"
                >
                  <div className={`w-3 h-3 rounded-full ${color.color}`} />
                  {color.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Link to Full Settings */}
          <div className="pt-2 border-t flex gap-2">
            <Link href="/dashboard/settings" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full flex items-center gap-2">
                <Settings className="h-4 w-4" />
                More Options
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
