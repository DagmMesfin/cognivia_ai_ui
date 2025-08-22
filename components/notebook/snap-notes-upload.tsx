"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { notebooksAPI } from "@/lib/api/notebooks"

interface SnapNotesUploadProps {
  notebookId: string
  onUploadSuccess: (googleDriveLink: string) => void
}

export function SnapNotesUpload({ notebookId, onUploadSuccess }: SnapNotesUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  const handleFileUpload = async (file: File, retry = 0) => {
    setError(null)
    setUploadProgress(0)
    setRetryCount(retry)

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit")
      return
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload PDF, DOCX, or TXT files only")
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Create form data for local API
      const formData = new FormData()
      formData.append("file", file)

      setUploadProgress(30)

      console.log("Uploading file through local API:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Call local API route instead of external API directly
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(60)

      const responseText = await uploadResponse.text()
      console.log("Local API raw response:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        throw new Error("Invalid response from server")
      }

      console.log("Local API response:", responseData)

      if (!uploadResponse.ok) {
        throw new Error(responseData.error || `Server returned ${uploadResponse.status}`)
      }

      setUploadProgress(80)

      if (!responseData.web_view_link) {
        throw new Error("Invalid response: missing web_view_link")
      }

      // Update notebook with Google Drive link using the API
      console.log("Updating notebook with Google Drive link:", responseData.web_view_link)
      await notebooksAPI.updateNotebookWithDriveLink(notebookId, responseData.web_view_link)

      setUploadProgress(90)

      // Call success callback
      onUploadSuccess(responseData.web_view_link)

      setUploadProgress(100)

      // Reset state after success
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
        setRetryCount(0)
      }, 1000)
    } catch (error: any) {
      console.error("Upload error:", error)

      let errorMessage = "Upload failed. Please check your connection and try again."

      if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setUploadProgress(0)

      // Auto-retry logic for network errors
      if (retry < MAX_RETRIES && (errorMessage.includes("fetch") || errorMessage.includes("Network"))) {
        setError(`Connection issue. Retrying... (${retry + 1}/${MAX_RETRIES})`)
        setTimeout(() => {
          handleFileUpload(file, retry + 1)
        }, 3000) // Wait 3 seconds before retrying
        return
      }

      setIsUploading(false)
    }
  }

  const handleRetry = () => {
    if (selectedFile) {
      setRetryCount(0)
      handleFileUpload(selectedFile, 0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      setSelectedFile(file)
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      console.log("File dropped:", {
        name: file.name,
        size: file.size,
        type: file.type,
      })
      setSelectedFile(file)
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Check for network connectivity
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <p className="text-sm text-yellow-700">You are currently offline. Please check your internet connection.</p>
        </div>
      )}

      <div
        className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : isUploading
              ? "border-blue-300 bg-blue-25"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Upload Icon */}
        <div className="mb-6 flex justify-center">
          {uploadProgress === 100 ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <Upload className="h-16 w-16 text-blue-500" />
          )}
        </div>

        {/* Main Content */}
        <h3 className="mb-4 text-2xl font-bold text-gray-900">Upload Your Study Materials</h3>

        <p className="mb-6 text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
          Upload books, notes, or research documents to get started with AI-powered summarization and flashcard
          generation.
        </p>

        <p className="mb-8 text-sm text-gray-500">
          Supported formats: PDF, DOCX, TXT • Maximum file size: 10MB per file
        </p>

        {/* Progress Indicator */}
        {isUploading && (
          <div className="mb-6 space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">
                {uploadProgress < 30
                  ? "Preparing upload..."
                  : uploadProgress < 60
                    ? "Uploading to server..."
                    : uploadProgress < 80
                      ? "Processing document..."
                      : uploadProgress < 100
                        ? "Updating notebook..."
                        : "Upload complete!"}
              </span>
            </div>
            {selectedFile && (
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <FileText className="h-3 w-3" />
                <span>
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Display with Retry Button */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>

            {selectedFile && !isUploading && !error.includes("Retrying") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Upload
              </Button>
            )}
          </div>
        )}

        {/* Success Message */}
        {uploadProgress === 100 && !error && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700">Document uploaded successfully!</p>
          </div>
        )}

        {/* Upload Button */}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        <label htmlFor="file-upload">
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 text-base font-medium transition-all duration-200"
            disabled={isUploading}
            asChild
          >
            <span className="cursor-pointer">
              <Upload className="mr-2 h-5 w-5" />
              {isUploading ? "Uploading..." : "Choose Files to Upload"}
            </span>
          </Button>
        </label>

        <p className="mt-4 text-sm text-gray-500">or drag and drop files here</p>
      </div>
    </div>
  )
}
