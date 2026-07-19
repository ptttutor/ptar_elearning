import { NextResponse } from "next/server"
import { getBackendAuthHeaders } from "@/lib/server-auth"

export async function GET(req: Request) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured", attempts: [], pagination: {} },
      { status: 500 }
    )
  }

  try {
    const url = new URL(req.url)
    const search = url.search || ""
    const res = await fetch(`${baseUrl}/api/my-courses/exam-results${search}`, {
      headers: getBackendAuthHeaders(req),
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam results", attempts: [], pagination: {} },
      { status: 502 }
    )
  }
}

