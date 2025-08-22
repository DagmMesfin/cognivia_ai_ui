"use client"

import type React from "react"

import { useThemeSettings } from "@/lib/hooks/use-theme-settings"
import { DashboardNav } from "./dashboard-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { settings, getThemeClasses } = useThemeSettings()

  const backgroundClass =
    settings.style !== "default" ? `bg-gradient-to-br ${getThemeClasses(settings.style)}` : "bg-background"

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <DashboardNav />
      <main className="container py-6">{children}</main>
    </div>
  )
}
