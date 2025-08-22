"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudyGPTVoice } from "@/components/notebook/study-gpt-voice"
import { notebooksAPI } from "@/lib/api/notebooks"

interface StudyGPTProps {
  notebookId: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

// Update the chat container styling
const chatContainerStyles =
  "mb-4 flex-1 space-y-4 overflow-auto rounded-lg border p-4 min-h-[400px] bg-background dark:border-gray-800"

// Keep user messages blue (not dynamic)
const userMessageStyles = "bg-blue-100 dark:bg-blue-900/50"

// Keep assistant messages purple (not dynamic)
const assistantMessageStyles = "bg-purple-100 dark:bg-purple-900/50"

// Update the error message styling
const errorMessageStyles = "flex items-center justify-center h-full text-gray-500 dark:text-gray-400"

// Update the empty state styling
const emptyStateStyles = "flex items-center justify-center h-full text-gray-500 dark:text-gray-400"

// Keep loading indicator purple (not dynamic)
const loadingIndicatorStyles = "w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce"

export function StudyGPT({ notebookId }: StudyGPTProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notebookData, setNotebookData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem("cognivia_token")
        if (!token) {
          setError("You must be logged in to use StudyGPT.")
          return
        }

        // Fetch notebook data
        const notebook = await notebooksAPI.getNotebook(notebookId)
        setNotebookData(notebook)

        if (!notebook.google_drive_link) {
          setError("No study materials found. Please upload a document in the SnapNotes tab first.")
          return
        }

        // Add welcome message
        setMessages([
          {
            role: "assistant",
            content:
              "Hello! I'm your StudyGPT assistant. I can help you with questions about your study materials. What would you like to know?",
            timestamp: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error("Failed to initialize chat:", err)
        setError("Failed to initialize chat. Please try again.")
      }
    }

    initializeChat()
  }, [notebookId])

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || newMessage
    if (!messageToSend.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    if (!messageText) setNewMessage("")
    setIsLoading(true)

    try {
      if (!notebookData?.google_drive_link) {
        throw new Error("No study materials found. Please upload a document first.")
      }

      // Use notebooksAPI to send chat message
      const result = await notebooksAPI.sendChatMessage({
        sessionId: notebookId,
        action: "sendMessage",
        chatInput: messageToSend,
        google_drive_link: notebookData.google_drive_link,
      })

      const responseContent =
        result.output ||
        result.response ||
        result.message ||
        "I received your message but couldn't generate a proper response."

      // Add AI response
      const aiMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // If in voice mode, send response to voice handler
      if (isVoiceMode && (window as any).voiceHandleAIResponse) {
        ;(window as any).voiceHandleAIResponse(responseContent)
      }
    } catch (error) {
      console.error("Chat error:", error)

      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])

      // If in voice mode, send error to voice handler
      if (isVoiceMode && (window as any).voiceHandleAIResponse) {
        ;(window as any).voiceHandleAIResponse(errorMessage.content)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceMessage = async (message: string) => {
    await handleSendMessage(message)
  }

  if (isVoiceMode) {
    return (
      <StudyGPTVoice
        onExitVoiceMode={() => setIsVoiceMode(false)}
        onSendMessage={handleVoiceMessage}
        notebookId={notebookId}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center text-lg font-medium">
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
            className="mr-2 text-primary"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          StudyGPT
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1 inline"
            >
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
            Powered by AI
          </span>
          <Button variant="outline" size="sm" onClick={() => setIsVoiceMode(true)} disabled={!!error}>
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
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            Voice Mode
          </Button>
        </div>
      </div>

      <div className={chatContainerStyles}>
        {error ? (
          <div className={errorMessageStyles}>
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-lg font-medium mb-2">StudyGPT Unavailable</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className={emptyStateStyles}>
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-gray-400"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Ask questions about your study materials</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex max-w-[80%] items-start gap-2 rounded-lg p-3 ${
                  message.role === "user" ? userMessageStyles : assistantMessageStyles
                }`}
              >
                {message.role === "assistant" ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-ai.jpg" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                ) : null}
                <div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] items-start gap-2 rounded-lg p-3 bg-purple-100 dark:bg-purple-900/50">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-ai.jpg" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <div className={loadingIndicatorStyles}></div>
                <div className={loadingIndicatorStyles} style={{ animationDelay: "0.1s" }}></div>
                <div className={loadingIndicatorStyles} style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Ask a question about your study materials..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="pr-10"
            disabled={isLoading || !!error}
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-primary p-1 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || isLoading || !!error}
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
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
