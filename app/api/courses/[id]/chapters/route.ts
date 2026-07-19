import { NextResponse, NextRequest } from "next/server"
import { getBackendAuthHeaders } from "@/lib/server-auth"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured", data: [] },
      { status: 500 }
    )
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing course id", data: [] },
      { status: 400 }
    )
  }

  try {
    const url = new URL(req.url)
    const search = url.search || ""
    const res = await fetch(`${baseUrl}/api/courses/${encodeURIComponent(id)}/chapters${search}`, {
      headers: getBackendAuthHeaders(req),
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch chapters", data: [] },
      { status: 502 }
    )
  }
}
