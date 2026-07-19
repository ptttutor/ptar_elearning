import { headers } from "next/headers"

// Server Components run fetch() outside the browser, so relative URLs don't
// resolve — build an absolute same-origin URL from the incoming request
// headers (falls back to NEXTAUTH_URL when headers aren't available, e.g.
// during static generation).
export async function getBaseUrl() {
  try {
    const h = await headers()
    const host = h.get("x-forwarded-host") || h.get("host")
    const proto = h.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
    if (host) return `${proto}://${host}`
  } catch {}
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
}
