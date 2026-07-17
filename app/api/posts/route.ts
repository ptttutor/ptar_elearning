import { NextResponse } from "next/server"

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

    const cookie = req.headers.get("cookie") ?? ""
    const authorization = req.headers.get("authorization") ?? ""

    const headers: Record<string, string> = {}
    if (cookie) headers["cookie"] = cookie
    if (authorization) headers["authorization"] = authorization

    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/posts${search}`, {
      headers,
      // Public marketing content (banners/reviews/articles) — doesn't need to be
      // real-time fresh, and the home page alone fires 7 of these per pageview.
      next: { revalidate: 60 },
    })

    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch posts" },
      { status: 502 }
    )
  }
}

