import type { Metadata } from "next"
import Link from "next/link"
import { NotebooksList } from "@/components/dashboard/notebooks-list"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { StudyStreakWidget } from "@/components/dashboard/study-streak-widget"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Dashboard - Cognivia",
  description: "Manage your study notebooks",
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Notebooks</h1>
            <p className="text-muted-foreground">Organize your study materials and track your progress</p>
          </div>

          <NotebooksList />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RecentActivities />
            <StudyStreakWidget />
            <div className="flex flex-col gap-4">
              <Link href="/dashboard/study-calendar">
                <Button className="w-full h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-1"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span className="font-medium">Study Calendar</span>
                  </div>
                </Button>
              </Link>
              <Button variant="outline" className="h-16">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-1"
                  >
                    <path d="M3 3v5h5" />
                    <path d="M3 8a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4" />
                    <path d="M21 21v-5h-5" />
                    <path d="M21 16a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20" />
                  </svg>
                  <span className="text-sm">Quick Review</span>
                </div>
              </Button>
            </div>
          </div>

          
        </div>
      </DashboardShell>
    </ProtectedRoute>
  )
}
