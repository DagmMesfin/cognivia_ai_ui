// Replace the create notebook page with a redirect to the dashboard
// This page is no longer needed since we're using a dialog

import { redirect } from "next/navigation"

export default function CreateNotebookPage() {
  redirect("/dashboard")
}
