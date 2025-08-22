"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SnapNotesSummarize } from "@/components/notebook/snap-notes-summarize"
import { SnapNotesFlashcards } from "@/components/notebook/snap-notes-flashcards"

interface SnapNotesTabsProps {
  notebookId: string
  hasUploadedFiles: boolean
}

export function SnapNotesTabs({ notebookId, hasUploadedFiles }: SnapNotesTabsProps) {
  return (
    <Tabs defaultValue="summarize" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summarize">Summarize</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
      </TabsList>
      <TabsContent value="summarize" className="mt-6">
        <SnapNotesSummarize notebookId={notebookId} hasUploadedFiles={hasUploadedFiles} />
      </TabsContent>
      <TabsContent value="flashcards" className="mt-6">
        <SnapNotesFlashcards notebookId={notebookId} hasUploadedFiles={hasUploadedFiles} />
      </TabsContent>
    </Tabs>
  )
}
