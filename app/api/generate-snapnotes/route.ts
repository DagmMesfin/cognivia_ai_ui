import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notebook_id, google_drive_link } = body

    console.log("Generate snapnotes request:", { notebook_id, google_drive_link })

    if (!notebook_id || !google_drive_link) {
      return NextResponse.json({ error: "Missing required fields: notebook_id and google_drive_link" }, { status: 400 })
    }

    // Call the external webhook with increased timeout
    const webhookUrl = process.env.WEBHOOK_GENERATE_NOTES_URL!

    console.log(`Making snapnotes generation request to: ${webhookUrl}`)

    const response = await axios.post(
      webhookUrl,
      {
        notebook_id,
        google_drive_link,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 3 minutes timeout
        withCredentials: false,
      },
    )

    console.log(`Snapnotes generation response status: ${response.status}`)
    console.log(`Snapnotes generation success:`, response.data)

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("Snapnotes generation error:", error)

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { error: "Request timed out. The generation is taking longer than expected. Please try again later." },
          { status: 408 },
        )
      } else if (error.response) {
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `HTTP ${error.response.status}: ${error.response.statusText}`
        return NextResponse.json({ error: errorMessage }, { status: error.response.status })
      } else if (error.request) {
        return NextResponse.json(
          { error: "Network error: Unable to connect to snapnotes generation service." },
          { status: 503 },
        )
      } else {
        return NextResponse.json({ error: `Request setup error: ${error.message}` }, { status: 500 })
      }
    } else {
      return NextResponse.json(
        { error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 },
      )
    }
  }
}
