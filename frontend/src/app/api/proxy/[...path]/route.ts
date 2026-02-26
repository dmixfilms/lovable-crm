import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, "GET")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, "POST")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, "PATCH")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, "PUT")
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, "DELETE")
}

async function handleProxyRequest(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const params = await paramsPromise
    const pathSegments = params.path || []
    const pathStr = pathSegments.join("/")

    // Get the backend URL from hostname
    const hostname = request.headers.get("host")?.split(":")[0] || "localhost"
    const queryString = request.nextUrl.search
    const backendUrl = `http://${hostname}:8000/${pathStr}${queryString}`

    console.log(`🔐 Proxy [${method}]: Forwarding to ${backendUrl}`)

    // Get request body if exists
    let body: any = undefined
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        body = await request.json()
      } catch {
        // No body
      }
    }

    // Get authorization header
    const authorization = request.headers.get("authorization")

    // Forward to backend
    const response = await fetch(backendUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
      ...(body && { body: JSON.stringify(body) }),
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
