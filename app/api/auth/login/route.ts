import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.COGNIVIA_API_BASE_URL!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Proxy: Forwarding login request to:", `${API_BASE_URL}/api/v1/users/login`)

    const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log("Proxy: API error response:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("Proxy: API success response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy: Error forwarding request:", error)
    return NextResponse.json({ error: "Failed to connect to authentication service" }, { status: 500 })
  }
}
