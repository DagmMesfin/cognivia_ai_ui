"use client"

import { NotebookHeader } from "@/components/notebook/notebook-header"
import { NotebookTabs } from "@/components/notebook/notebook-tabs"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useNotebook } from "@/lib/hooks/use-notebooks"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useEffect } from "react"

interface NotebookPageClientProps {
  params: { notebookId: string }
}

export default function NotebookPageClient({ params }: NotebookPageClientProps) {
  const notebookId = params?.notebookId
  const { notebook, isLoading, error } = useNotebook(notebookId)

  // Add debugging logs
  useEffect(() => {
    console.log("NotebookPageClient Debug:", {
      paramsReceived: params,
      notebookId,
      notebookIdType: typeof notebookId,
      notebookIdLength: notebookId?.length,
      notebook,
      isLoading,
      error,
      notebookExists: !!notebook,
      notebookKeys: notebook ? Object.keys(notebook) : null,
    })
  }, [params, notebookId, notebook, isLoading, error])

  // Early return if no notebookId
  if (!notebookId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="mb-4 rounded-full bg-red-100 p-4 mx-auto w-fit">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Notebook URL</h2>
            <p className="text-gray-600 mb-4">No notebook ID was provided in the URL.</p>
            <div className="text-xs text-gray-500 mb-4">Debug: {JSON.stringify({ params, notebookId })}</div>
            <Button onClick={() => (window.location.href = "/dashboard")} variant="default">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="mt-6">
          <Skeleton className="h-10 w-full" />
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="mb-4 rounded-full bg-red-100 p-4 mx-auto w-fit">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notebook</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-xs text-gray-500 mb-4">Notebook ID: {notebookId}</div>
            <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={() => window.history.back()} variant="default">
              Go Back
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // More specific check for notebook existence
  if (!notebook || !notebook.id) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="mb-4 rounded-full bg-yellow-100 p-4 mx-auto w-fit">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Notebook Not Found</h2>
            <p className="text-gray-600 mb-4">The requested notebook could not be found or may have been deleted.</p>
            <div className="text-xs text-gray-500 mb-4">
              Notebook ID: {notebookId}
              <br />
              Debug: {JSON.stringify({ notebook, hasNotebook: !!notebook, hasId: !!notebook?.id })}
            </div>
            <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard")} variant="default">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <NotebookHeader notebook={notebook} />
      <NotebookTabs notebookId={notebookId} />
    </DashboardShell>
  )
}
