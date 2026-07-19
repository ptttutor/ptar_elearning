// Server-side helper used by every /api/* proxy route (Route Handlers) to
// forward a trustworthy identity to the backend. The browser's `jwt`
// httpOnly cookie (set on login) is the authoritative source — it rides
// along automatically on same-origin requests regardless of whether the
// calling page used the axios client (which also attaches an explicit
// Authorization header from localStorage) or a raw `fetch`. Never trust a
// client-supplied userId/email for identity; the backend now derives it
// from this bearer token instead.

export function getBackendAuthHeaders(req: Request): Record<string, string> {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const headers: Record<string, string> = { cookie: cookieHeader }

  const incomingAuth = req.headers.get("authorization")
  if (incomingAuth) {
    headers["authorization"] = incomingAuth
    return headers
  }

  const match = cookieHeader.split(/;\s*/).find((p) => p.startsWith("jwt="))
  if (match) {
    try {
      const token = decodeURIComponent(match.split("=").slice(1).join("="))
      if (token) headers["authorization"] = `Bearer ${token}`
    } catch {}
  }

  return headers
}
