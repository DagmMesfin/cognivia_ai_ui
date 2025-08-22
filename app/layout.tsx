import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/hooks/use-auth"
import { SplashScreen } from "@/components/splash-screen"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cognivia - AI-Powered Study Assistant",
  description:
    "Transform your learning experience with AI-powered study tools, smart note-taking, and personalized learning paths.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <SplashScreen />
            <div className="min-h-screen bg-background text-foreground">{children}</div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
