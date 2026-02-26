import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the backend URL from hostname
    const hostname = request.headers.get("host")?.split(":")[0] || "localhost"
    const backendUrl = `http://${hostname}:8000/auth/login`

    console.log("🔐 Proxy: Forwarding login to", backendUrl)

    // Forward to backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Proxy error:", error)
    return NextResponse.json({ detail: "Proxy error" }, { status: 500 })
  }
}
