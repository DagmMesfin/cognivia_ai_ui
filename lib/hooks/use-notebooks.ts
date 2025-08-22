"use client"

import { useState, useEffect } from "react"
import { notebooksAPI, type Notebook, type CreateNotebookRequest } from "@/lib/api/notebooks"

// Add this helper function at the top of the file
function isValidObjectId(id: string): boolean {
  // MongoDB ObjectID is 24 characters long and contains only hexadecimal characters
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]) // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotebooks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await notebooksAPI.getUserNotebooks()
      // Ensure data is an array
      setNotebooks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching notebooks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch notebooks")
      setNotebooks([]) // Set to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const createNotebook = async (data: CreateNotebookRequest): Promise<Notebook> => {
    try {
      const newNotebook = await notebooksAPI.createNotebook(data)
      setNotebooks((prev) => [...(prev || []), newNotebook])
      return newNotebook
    } catch (err) {
      console.error("Error creating notebook:", err)
      throw err
    }
  }

  const updateNotebook = async (id: string, data: Partial<CreateNotebookRequest>) => {
    try {
      await notebooksAPI.updateNotebook(id, data)
      await fetchNotebooks() // Refresh the list
    } catch (err) {
      console.error("Error updating notebook:", err)
      throw err
    }
  }

  const deleteNotebook = async (id: string) => {
    try {
      await notebooksAPI.deleteNotebook(id)
      setNotebooks((prev) => (prev || []).filter((notebook) => notebook.id !== id))
    } catch (err) {
      console.error("Error deleting notebook:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchNotebooks()
  }, [])

  return {
    notebooks,
    isLoading,
    error,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    refetch: fetchNotebooks,
  }
}

export function useNotebook(id: string | undefined) {
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotebook = async () => {
      if (!id || typeof id !== "string" || id.trim() === "") {
        console.log("useNotebook: Invalid or missing ID:", { id, type: typeof id })
        setIsLoading(false)
        setError("No valid notebook ID provided")
        setNotebook(null)
        return
      }

      // Add ObjectID validation
      if (!isValidObjectId(id.trim())) {
        console.log("useNotebook: Invalid ObjectID format:", id)
        setIsLoading(false)
        setError("Invalid notebook ID format")
        setNotebook(null)
        return
      }

      try {
        console.log(`useNotebook: Fetching notebook with ID: "${id}"`)
        setIsLoading(true)
        setError(null)
        setNotebook(null) // Reset notebook state

        const data = await notebooksAPI.getNotebook(id)
        console.log("useNotebook: Received data:", data)

        if (!data) {
          console.log("useNotebook: No data received from API")
          setError("Notebook not found")
          setNotebook(null)
        } else if (!data.id) {
          console.log("useNotebook: Data received but no ID field:", data)
          setError("Invalid notebook data received")
          setNotebook(null)
        } else {
          console.log("useNotebook: Successfully set notebook:", data)
          setNotebook(data)
          setError(null)
        }
      } catch (err) {
        console.error("useNotebook: Error fetching notebook:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch notebook"
        setError(errorMessage)
        setNotebook(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotebook()
  }, [id])

  return { notebook, isLoading, error }
}
