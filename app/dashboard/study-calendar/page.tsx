import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StudyCalendar } from "@/components/study-calendar/study-calendar"

export const metadata: Metadata = {
  title: "Study Calendar - Cognivia",
  description: "Plan and track your study sessions with intelligent analytics",
}

export default function StudyCalendarPage() {
  return (
    <DashboardShell>
      <StudyCalendar />
    </DashboardShell>
  )
}
