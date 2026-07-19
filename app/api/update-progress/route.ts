import { NextResponse } from "next/server"
import { getBackendAuthHeaders } from "@/lib/server-auth"

export async function POST(req: Request) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()

    const res = await fetch(`${baseUrl}/api/update-progress`, {
      method: "POST",
      headers: { "content-type": "application/json", ...getBackendAuthHeaders(req) },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to update progress" },
      { status: 502 }
    )
  }
}
