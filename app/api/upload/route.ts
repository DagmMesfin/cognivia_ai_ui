import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API route called")

    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file found in form data")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Please upload PDF, DOCX, or TXT files only" }, { status: 400 })
    }

    // Convert file to buffer and create a new File object for the external API
    const fileBuffer = await file.arrayBuffer()
    const fileBlob = new Blob([fileBuffer], { type: file.type })

    // Create new FormData for the external API
    const externalFormData = new FormData()
    // Try both field names to see which one works
    externalFormData.append("file", fileBlob, file.name)

    console.log("Calling external Google Drive API with file:", {
      name: file.name,
      size: fileBuffer.byteLength,
      type: file.type,
    })

    // Call the external Google Drive API
    const uploadResponse = await fetch(process.env.GOOGLE_DRIVE_UPLOADER_URL!, {
      method: "POST",
      body: externalFormData,
    })

    console.log("External API response status:", uploadResponse.status)
    console.log("External API response headers:", Object.fromEntries(uploadResponse.headers.entries()))

    const responseText = await uploadResponse.text()
    console.log("External API raw response:", responseText)

    if (!uploadResponse.ok) {
      console.error("External API error response:", responseText)
      return NextResponse.json(
        { error: `Upload service error: ${uploadResponse.status} - ${responseText}` },
        { status: uploadResponse.status },
      )
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return NextResponse.json({ error: "Invalid response format from upload service" }, { status: 500 })
    }

    console.log("External API success:", result)

    // Validate the response has the expected structure
    if (!result.web_view_link) {
      console.error("Invalid response structure:", result)
      return NextResponse.json(
        { error: "Invalid response from upload service - missing web_view_link" },
        { status: 500 },
      )
    }

    // Return the successful response
    return NextResponse.json({
      message: result.message || "File uploaded successfully",
      file_id: result.file_id,
      web_view_link: result.web_view_link,
    })
  } catch (error: any) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: `Server error: ${error.message || "Unknown error occurred"}` }, { status: 500 })
  }
}
