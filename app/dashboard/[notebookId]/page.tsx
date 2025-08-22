import type { Metadata } from "next"
import NotebookPageClient from "./NotebookPageClient"

export const metadata: Metadata = {
  title: "Notebook - Cognivia",
  description: "Study with AI assistance",
}

interface PageProps {
  params: Promise<{ notebookId: string }>
}

export default async function NotebookPage({ params }: PageProps) {
  const resolvedParams = await params
  return <NotebookPageClient params={resolvedParams} />
}
