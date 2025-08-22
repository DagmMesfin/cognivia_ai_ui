import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const path = params.path.join("/")
    console.log("Proxy POST request to:", path)

    const body = await request.json()
    console.log("Request body:", body)

    // Determine the target URL based on the path
    let targetUrl: string

    if (path.startsWith("webhook/")) {
      // Handle webhook requests to the chat service
      targetUrl = `${process.env.EC2_CHAT_SERVICE_URL}/${path}`
    } else {
      // Handle regular API requests
      targetUrl = `${process.env.COGNIVIA_API_BASE_URL}/api/v1/${path}`
    }

    console.log("Target URL:", targetUrl)

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return NextResponse.json(
        { error: `Request failed: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Success response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Internal proxy error" }, { status: 500 })
  }
}
