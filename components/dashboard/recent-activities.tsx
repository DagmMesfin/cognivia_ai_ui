"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivities() {
  const activities = [
    {
      type: "quiz",
      title: "Completed Biology Quiz 3",
      description: "Scored 92% on Cell Structure",
      time: "2 hours ago",
      icon: "🧪",
      color: "bg-green-100 text-green-600",
    },
    {
      type: "study",
      title: "Studied Mathematics",
      description: "45 minutes on Calculus",
      time: "5 hours ago",
      icon: "📐",
      color: "bg-blue-100 text-blue-600",
    },
    {
      type: "note",
      title: "Added new notes",
      description: "Chemistry Chapter 4 summary",
      time: "1 day ago",
      icon: "📝",
      color: "bg-orange-100 text-orange-600",
    },
    {
      type: "flashcard",
      title: "Reviewed flashcards",
      description: "Spanish vocabulary - 25 cards",
      time: "2 days ago",
      icon: "🌍",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
            className="text-blue-500"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m12 6 4 6-4 6" />
            <path d="M8 12h8" />
          </svg>
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.color}`}>
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
