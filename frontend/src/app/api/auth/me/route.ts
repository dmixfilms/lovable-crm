import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    console.log("🔐 Proxy /api/auth/me: Token received?", !!token)

    if (!token) {
      return NextResponse.json({ detail: "No token provided" }, { status: 401 })
    }

    // Get the backend URL from hostname
    const hostname = request.headers.get("host")?.split(":")[0] || "localhost"
    const backendUrl = `http://${hostname}:8000/auth/me`

    console.log("🔐 Proxy /api/auth/me: Forwarding to", backendUrl)
    console.log("🔐 Proxy /api/auth/me: Authorization header:", token.substring(0, 20) + "...")

    // Forward to backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })

    console.log("🔐 Proxy /api/auth/me: Backend response status:", response.status)
    const data = await response.json()
    console.log("🔐 Proxy /api/auth/me: Backend response:", data)

    if (!response.ok) {
      console.error("❌ Proxy /api/auth/me: Backend returned error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("✅ Proxy /api/auth/me: Success")
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Proxy /api/auth/me error:", error)
    return NextResponse.json({ detail: "Proxy error: " + String(error) }, { status: 500 })
  }
}
