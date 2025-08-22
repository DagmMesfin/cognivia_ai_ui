"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useNotebooks } from "@/lib/hooks/use-notebooks"
import { AlertCircle, Plus, MoreVertical, BookOpen, Calendar, Flame, Search } from "lucide-react"
import { CreateNotebookDialog } from "@/components/notebook/create-notebook-dialog"

export function NotebooksList() {
  const router = useRouter()
  const { notebooks, isLoading, error, deleteNotebook } = useNotebooks()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleDeleteNotebook = async (id: string, event: React.MouseEvent) => {
    event.preventDefault() // Prevent navigation
    event.stopPropagation()

    if (!confirm("Are you sure you want to delete this notebook?")) {
      return
    }

    try {
      setDeletingId(id)
      await deleteNotebook(id)
    } catch (err) {
      console.error("Failed to delete notebook:", err)
      alert("Failed to delete notebook. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  // Filter notebooks based on search query
  const filteredNotebooks = Array.isArray(notebooks)
    ? notebooks.filter(
        (notebook) =>
          notebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (notebook.type && notebook.type.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : []

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading notebooks</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Search and Create Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notebook
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredNotebooks.map((notebook) => (
          <Link
            key={notebook.id}
            href={`/dashboard/${notebook.id}`}
            className="group relative rounded-lg border p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all bg-card"
          >
            {/* Color indicator */}
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-lg"
              style={{ backgroundColor: notebook.color || "#3B82F6" }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl">{notebook.icon || "📘"}</div>
                <h3 className="font-semibold truncate">{notebook.name}</h3>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Change Icon
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 dark:text-red-400"
                    onClick={(e) => handleDeleteNotebook(notebook.id, e)}
                    disabled={deletingId === notebook.id}
                  >
                    {deletingId === notebook.id ? (
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-red-500 dark:border-red-400 border-t-transparent" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {new Date(notebook.updated_at).toLocaleDateString()}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400">
                <BookOpen className="h-4 w-4" />
                <span>{notebook.type || "Study"}</span>
              </div>

              {notebook.snapnotes_id && (
                <div className="flex items-center gap-1 text-sm text-green-500 dark:text-green-400">
                  <Flame className="h-4 w-4" />
                  <span>Notes</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="text-xs">
                  {notebook.user_id ? notebook.user_id.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              <span className="text-xs text-muted-foreground">
                Created {new Date(notebook.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredNotebooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {searchQuery ? "No notebooks match your search" : "No notebooks yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery ? "Try a different search term" : "Get started by creating your first notebook."}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notebook
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Notebook Dialog */}
      <CreateNotebookDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
