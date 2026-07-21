import { NextResponse } from "next/server"
import { requireUser } from "@/lib/requireUser"
import { isAllowedProxyTarget } from "@/lib/proxy-allowlist"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    if (!requireUser(req as any)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const target = searchParams.get("url")
    const rawFilename = searchParams.get("filename") || "file.pdf"

    if (!target) {
      return NextResponse.json(
        { success: false, message: "Missing url parameter" },
        { status: 400 }
      )
    }
    if (!isAllowedProxyTarget(target)) {
      return NextResponse.json(
        { success: false, message: "Target host not allowed" },
        { status: 400 }
      )
    }


    const ua = req.headers.get("user-agent") || ""
    const isiOS = /\b(iPad|iPhone|iPod)\b/i.test(ua)
    const isSafari = /Safari/i.test(ua) && !/(Chrome|CriOS|FxiOS|EdgiOS)/i.test(ua)
    const isIOSSafari = isiOS && isSafari

    const range = req.headers.get("range") || undefined
    const upstream = await fetch(target, {
      headers: range ? { range } : undefined,
      cache: "no-store",
    })

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { success: false, message: `Upstream error: ${upstream.status}` },
        { status: 502 }
      )
    }


    let body: ReadableStream | ArrayBuffer | null = upstream.body
    let contentLength = upstream.headers.get("content-length")
    if (!body || (isIOSSafari && !contentLength)) {
      const buf = await upstream.arrayBuffer()
      body = buf
      contentLength = String(buf.byteLength)
    }

 
    const asciiFallback = rawFilename.replace(/[^\x20-\x7E]+/g, "_")
    const encoded = encodeURIComponent(rawFilename)

    const upstreamCT = upstream.headers.get("content-type") || "application/octet-stream"
    const effectiveCT = isIOSSafari ? "application/octet-stream" : upstreamCT

    const headers: Record<string, string> = {
      "content-type": effectiveCT,
      "content-disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "vary": "User-Agent",
    }

    
    for (const h of ["content-range", "accept-ranges", "etag", "last-modified"]) {
      const v = upstream.headers.get(h)
      if (v) headers[h] = v
    }
    if (contentLength) headers["content-length"] = contentLength

    const status = upstream.status === 206 ? 206 : 200

  
    if (searchParams.get("debug") === "1") {
      return NextResponse.json({
        ua, isiOS, isSafari, isIOSSafari,
        upstream: {
          status: upstream.status,
          contentType: upstreamCT,
          contentLength: upstream.headers.get("content-length"),
        },
        effectiveResponse: { status, headers },
      })
    }

    return new NextResponse(body as any, { status, headers })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to proxy download" },
      { status: 500 }
    )
  }
}
