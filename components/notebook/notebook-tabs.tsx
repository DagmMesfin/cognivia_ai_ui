"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudyGPT } from "@/components/notebook/study-gpt"
import { PrepPilot } from "@/components/notebook/prep-pilot"
import { SnapNotes } from "@/components/notebook/snap-notes"
import { EduTuner } from "@/components/notebook/edu-tuner"
import { SnapNotesUpload } from "@/components/notebook/snap-notes-upload"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Sparkles } from "lucide-react"
import { notebooksAPI } from "@/lib/api/notebooks"

interface NotebookTabsProps {
  notebookId: string
}

interface NotebookState {
  hasGoogleDriveLink: boolean
  showUploadUI: boolean
  showGenerateButton: boolean
  showNotes: boolean
  isUploading: boolean
  isGenerating: boolean
}

export function NotebookTabs({ notebookId }: NotebookTabsProps) {
  const [activeTab, setActiveTab] = useState("snapnotes")
  const [notebookState, setNotebookState] = useState<NotebookState>({
    hasGoogleDriveLink: false,
    showUploadUI: true,
    showGenerateButton: false,
    showNotes: false,
    isUploading: false,
    isGenerating: false,
  })

  // Check notebook state on component mount
  useEffect(() => {
    checkNotebookState()
  }, [notebookId])

  const checkNotebookState = async () => {
    try {
      const notebook = await notebooksAPI.getNotebook(notebookId)

      if (notebook && notebook.google_drive_link) {
        // Has Google Drive link, check for snapnotes
        try {
          const snapnotes = await notebooksAPI.getNotebookSnapnotes(notebookId)
          if (snapnotes && snapnotes.summaryByChapter && snapnotes.summaryByChapter.length > 0) {
            // Notes exist, show them
            setNotebookState({
              hasGoogleDriveLink: true,
              showUploadUI: false,
              showGenerateButton: false,
              showNotes: true,
              isUploading: false,
              isGenerating: false,
            })
          } else {
            // Has Google Drive link but no notes, show generate button
            setNotebookState({
              hasGoogleDriveLink: true,
              showUploadUI: false,
              showGenerateButton: true,
              showNotes: false,
              isUploading: false,
              isGenerating: false,
            })
          }
        } catch (error) {
          // Error fetching snapnotes (likely 404), show generate button
          setNotebookState({
            hasGoogleDriveLink: true,
            showUploadUI: false,
            showGenerateButton: true,
            showNotes: false,
            isUploading: false,
            isGenerating: false,
          })
        }
      } else {
        // No Google Drive link, show upload UI
        setNotebookState({
          hasGoogleDriveLink: false,
          showUploadUI: true,
          showGenerateButton: false,
          showNotes: false,
          isUploading: false,
          isGenerating: false,
        })
      }
    } catch (error) {
      console.error("Error checking notebook state:", error)
      // Default to upload UI on error
      setNotebookState({
        hasGoogleDriveLink: false,
        showUploadUI: true,
        showGenerateButton: false,
        showNotes: false,
        isUploading: false,
        isGenerating: false,
      })
    }
  }

  const handleFileUploadSuccess = async (googleDriveLink: string) => {
    try {
      setNotebookState({
        hasGoogleDriveLink: true,
        showUploadUI: false,
        showGenerateButton: true,
        showNotes: false,
        isUploading: false,
        isGenerating: false,
      })
    } catch (error) {
      console.error("Error updating notebook state:", error)
    }
  }

  const handleGenerateNotes = async () => {
    setNotebookState((prev) => ({
      ...prev,
      isGenerating: true,
      showGenerateButton: false,
    }))

    try {
      const notebook = await notebooksAPI.getNotebook(notebookId)

      if (notebook && notebook.google_drive_link) {
        const response = await fetch(
          "https://ec2-13-60-68-60.eu-north-1.compute.amazonaws.com/webhook/generate-notes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              notebook_id: notebookId,
              google_drive_link: notebook.google_drive_link,
            }),
          },
        )

        if (response.ok) {
          const result = await response.json()

          console.log(result)

          // If the response contains a snapnotes ID, update the notebook
          if (result.id) {
            try {
              await notebooksAPI.updateNotebook(notebookId, {
                snapnotes_id: result.id,
              })
            } catch (updateError) {
              console.error("Error updating notebook with snapnotes ID:", updateError)
            }
          }

          // Start polling for snapnotes with retry mechanism
          pollForSnapnotes(0)
        } else {
          throw new Error("Notes generation failed")
        }
      } else {
        throw new Error("No Google Drive link found")
      }
    } catch (error) {
      console.error("Error generating notes:", error)
      setNotebookState((prev) => ({
        ...prev,
        isGenerating: false,
        showGenerateButton: true,
      }))
    }
  }

  const pollForSnapnotes = async (retryCount: number) => {
    const maxRetries = 10
    const retryDelay = 3000 // 3 seconds

    try {
      const snapnotes = await notebooksAPI.getNotebookSnapnotes(notebookId)

      if (snapnotes && snapnotes.summaryByChapter && snapnotes.summaryByChapter.length > 0) {
        // Snapnotes successfully fetched, show them
        setNotebookState({
          hasGoogleDriveLink: true,
          showUploadUI: false,
          showGenerateButton: false,
          showNotes: true,
          isUploading: false,
          isGenerating: false,
        })
      } else {
        throw new Error("Snapnotes not ready yet")
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        console.log(`Snapnotes not ready, retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`)
        setTimeout(() => {
          pollForSnapnotes(retryCount + 1)
        }, retryDelay)
      } else {
        console.error("Max retries reached, snapnotes generation may have failed")
        setNotebookState((prev) => ({
          ...prev,
          isGenerating: false,
          showGenerateButton: true,
        }))
      }
    }
  }

  return (
    <Tabs defaultValue="snapnotes" className="mt-6" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="snapnotes"
          className={`rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
            activeTab === "snapnotes" ? "border-blue-500 font-medium" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          SnapNotes
        </TabsTrigger>
        <TabsTrigger
          value="studygpt"
          className={`rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
            activeTab === "studygpt" ? "border-blue-500 font-medium" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          StudyGPT
        </TabsTrigger>
        <TabsTrigger
          value="preppilot"
          className={`rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
            activeTab === "preppilot" ? "border-blue-500 font-medium" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          PrepPilot
        </TabsTrigger>
        <TabsTrigger
          value="edutuner"
          className={`rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
            activeTab === "edutuner" ? "border-blue-500 font-medium" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          EduTuner
        </TabsTrigger>
      </TabsList>

      <TabsContent value="snapnotes" className="mt-6 border-none p-0">
        {notebookState.showUploadUI && (
          <div className="py-8">
            <SnapNotesUpload notebookId={notebookId} onUploadSuccess={handleFileUploadSuccess} />
          </div>
        )}

        {notebookState.showGenerateButton && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Document Ready!</h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Your document has been uploaded successfully. Generate AI-powered notes to get started with your
                studies.
              </p>
            </div>

            <Button
              onClick={handleGenerateNotes}
              disabled={notebookState.isGenerating}
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-8 py-3 text-base font-medium"
            >
              {notebookState.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Notes...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate SnapNotes
                </>
              )}
            </Button>

            {notebookState.isGenerating && (
              <p className="text-sm text-gray-500">This may take a few minutes. Please don't close this page.</p>
            )}
          </div>
        )}

        {notebookState.showNotes && <SnapNotes notebookId={notebookId} />}
      </TabsContent>

      <TabsContent value="studygpt" className="mt-6 border-none p-0">
        <StudyGPT notebookId={notebookId} />
      </TabsContent>
      <TabsContent value="preppilot" className="mt-6 border-none p-0">
        <PrepPilot notebookId={notebookId} />
      </TabsContent>
      <TabsContent value="edutuner" className="mt-6 border-none p-0">
        <EduTuner notebookId={notebookId} />
      </TabsContent>
    </Tabs>
  )
}
