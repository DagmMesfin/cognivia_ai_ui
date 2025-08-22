import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.COGNIVIA_API_BASE_URL!

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Special case: if the ID is "user", this should be handled by the user route
    if (id === "user") {
      console.error("Invalid route: /api/notebooks/user should be handled by its own route handler")
      return NextResponse.json({ error: "Invalid route: Use /api/notebooks/user endpoint instead" }, { status: 400 })
    }

    // Validate ObjectID format
    if (!id || !isValidObjectId(id)) {
      console.error("Invalid ObjectID format:", id)
      return NextResponse.json({ error: "Invalid notebook ID format" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")

    console.log("Proxying get notebook request for ID:", id)

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/${id}`, {
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Special case: if the ID is "user", this is an invalid route
    if (id === "user") {
      return NextResponse.json({ error: "Invalid route: Cannot update user notebooks collection" }, { status: 400 })
    }

    // Validate ObjectID format
    if (!id || !isValidObjectId(id)) {
      console.error("Invalid ObjectID format:", id)
      return NextResponse.json({ error: "Invalid notebook ID format" }, { status: 400 })
    }

    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    console.log("Proxying update notebook request for ID:", id, body)

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/${id}`, {
      method: "PUT",
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Special case: if the ID is "user", this is an invalid route
    if (id === "user") {
      return NextResponse.json({ error: "Invalid route: Cannot delete user notebooks collection" }, { status: 400 })
    }

    // Validate ObjectID format
    if (!id || !isValidObjectId(id)) {
      console.error("Invalid ObjectID format:", id)
      return NextResponse.json({ error: "Invalid notebook ID format" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")

    console.log("Proxying delete notebook request for ID:", id)

    const response = await fetch(`${API_BASE_URL}/api/v1/notebooks/${id}`, {
      method: "DELETE",
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
