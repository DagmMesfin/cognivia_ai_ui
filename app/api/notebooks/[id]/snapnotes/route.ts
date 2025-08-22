import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.COGNIVIA_API_BASE_URL!

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log(`Fetching snapnotes for notebook: ${id}`)

    // Get authorization header from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/${id}/snapnotes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    console.log(`API Response Status: ${response.status}`)
    console.log(`API Response Headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `API returned ${response.status}: ${response.statusText}`,
      }))
      console.log(`API Error:`, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(`API Success:`, data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy Error:", error)
    return NextResponse.json({ error: "Failed to fetch snapnotes from API" }, { status: 500 })
  }
}
