import { NextResponse } from "next/server"
import { getBackendAuthHeaders } from "@/lib/server-auth"

export async function GET(req: Request) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const url = new URL(req.url)
    const search = url.search || ""
    const res = await fetch(`${baseUrl}/api/progress${search}`, {
      headers: getBackendAuthHeaders(req),
      cache: "no-store",
    })
    
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to get progress" },
      { status: 502 }
    )
  }
}

export async function DELETE(req: Request) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || ""
    const courseId = url.searchParams.get("courseId") || ""
    const res = await fetch(`${baseUrl}/api/progress`, {
      method: "PUT",
      headers: { "content-type": "application/json", ...getBackendAuthHeaders(req) },
      body: JSON.stringify({ userId, courseId, progress: 0 }),
      cache: "no-store",
    })
    
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to reset progress" },
      { status: 502 }
    )
  }
}
