import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "API_BASE_URL is not configured", data: [] },
      { status: 500 }
    )
  }

  try {
    const requestUrl = new URL(req.url)
    const search = requestUrl.search
    const cookie = req.headers.get("cookie") ?? ""
    const upstream = `${baseUrl.replace(/\/$/, "")}/api/courses${search}`
    const res = await fetch(upstream, {
      // Public course catalog — courses rarely change, so cache longer than
      // the posts feed to further cut DB load.
      next: { revalidate: 600 },
      headers: { cookie },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses", data: [] },
      { status: 502 }
    )
  }
}
