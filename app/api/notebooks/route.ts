import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.COGNIVIA_API_BASE_URL!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    console.log("Proxying notebook creation request:", body)

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("API Error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("API Success:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    console.log("Proxying get user notebooks request")

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("API Error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("API Success:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
