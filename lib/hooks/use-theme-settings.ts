"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

type ThemeAccent = "blue" | "green" | "purple" | "orange" | "pink" | "teal"
type BorderRadius = "default" | "subtle" | "rounded"
type AnimationMode = "normal" | "reduced" | "none"
type ThemeStyle =
  | "default"
  | "gradient-blue"
  | "gradient-green"
  | "gradient-purple"
  | "gradient-orange"
  | "gradient-pink"
  | "gradient-teal"

interface ThemeSettings {
  accent: ThemeAccent
  radius: BorderRadius
  animation: AnimationMode
  style: ThemeStyle
}

const defaultSettings: ThemeSettings = {
  accent: "blue",
  radius: "default",
  animation: "normal",
  style: "default",
}

// Accent color mappings to HSL values
const accentColorMap = {
  blue: {
    light: "221.2 83.2% 53.3%",
    dark: "217.2 91.2% 59.8%",
    foreground: {
      light: "210 40% 98%",
      dark: "222.2 84% 4.9%",
    },
  },
  green: {
    light: "142.1 76.2% 36.3%",
    dark: "142.1 70.6% 45.3%",
    foreground: {
      light: "210 40% 98%",
      dark: "210 40% 98%",
    },
  },
  purple: {
    light: "262.1 83.3% 57.8%",
    dark: "263.4 70% 50.4%",
    foreground: {
      light: "210 40% 98%",
      dark: "210 40% 98%",
    },
  },
  orange: {
    light: "24.6 95% 53.1%",
    dark: "20.5 90.2% 48.2%",
    foreground: {
      light: "210 40% 98%",
      dark: "210 40% 98%",
    },
  },
  pink: {
    light: "330.4 81.2% 60.4%",
    dark: "326.8 75.7% 56.9%",
    foreground: {
      light: "210 40% 98%",
      dark: "210 40% 98%",
    },
  },
  teal: {
    light: "173.4 80.4% 40%",
    dark: "172.5 66% 50.4%",
    foreground: {
      light: "210 40% 98%",
      dark: "210 40% 98%",
    },
  },
}

export function useThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem("cognivia_theme_settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        applySettings(parsed)
      } catch (e) {
        console.error("Failed to parse theme settings", e)
      }
    } else {
      // Apply default settings on first load
      applySettings(defaultSettings)
    }
  }, [])

  // Apply theme settings to document
  const applySettings = (settings: ThemeSettings) => {
    if (!mounted && typeof window === "undefined") return

    const root = document.documentElement
    const isDark = document.documentElement.classList.contains("dark")

    // Get the accent color values
    const accentColors = accentColorMap[settings.accent]

    // Apply primary color based on accent selection
    const primaryColor = isDark ? accentColors.dark : accentColors.light
    const primaryForeground = isDark ? accentColors.foreground.dark : accentColors.foreground.light

    root.style.setProperty("--primary", primaryColor)
    root.style.setProperty("--primary-foreground", primaryForeground)

    // Apply border radius
    root.setAttribute("data-radius", settings.radius)

    // Apply animation settings
    document.body.classList.remove("no-animation", "reduced-animation")
    if (settings.animation === "none") {
      document.body.classList.add("no-animation")
    } else if (settings.animation === "reduced") {
      document.body.classList.add("reduced-animation")
    }

    // Apply theme style
    root.setAttribute("data-theme-style", settings.style)

    // Apply gradient backgrounds based on style
    if (settings.style !== "default") {
      const gradientClass = getGradientClass(settings.style)
      root.style.setProperty("--theme-gradient", gradientClass)
    } else {
      root.style.removeProperty("--theme-gradient")
    }

    // Update ring color to match primary
    root.style.setProperty("--ring", primaryColor)
  }

  // Listen for theme changes to reapply accent colors
  useEffect(() => {
    if (mounted) {
      // Small delay to ensure theme class is applied
      setTimeout(() => {
        applySettings(settings)
      }, 10)
    }
  }, [theme, mounted])

  const getGradientClass = (style: ThemeStyle) => {
    const accent = settings.accent
    const accentColors = accentColorMap[accent]
    const isDark = document.documentElement.classList.contains("dark")
    const color = isDark ? accentColors.dark : accentColors.light

    return `linear-gradient(135deg, hsl(${color}) 0%, hsl(${color} / 0.8) 100%)`
  }

  // Update settings
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem("cognivia_theme_settings", JSON.stringify(updated))
    applySettings(updated)
  }

  const getThemeClasses = (themeName: string) => {
    const accent = settings.accent
    const themes = {
      default: "",
      [`gradient-${accent}`]: `from-${accent}-50 via-${accent}-100 to-${accent}-200 dark:from-${accent}-950 dark:via-${accent}-900 dark:to-${accent}-950`,
    }
    return themes[themeName as keyof typeof themes] || ""
  }

  return {
    theme,
    setTheme,
    settings,
    updateSettings,
    mounted,
    getThemeClasses,
  }
}
