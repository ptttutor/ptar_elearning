/**
 * New accounts (created via the LINE OAuth redirect chain) don't reliably
 * have the `jwt` cookie yet by the time some pages load, so requests from
 * those pages must also send the bearer token cached in localStorage —
 * same token lib/http.ts's axios interceptor attaches automatically.
 * Only needed for plain `fetch()` calls outside that axios instance.
 */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  let token: string | null = null
  try {
    token = localStorage.getItem("token")
  } catch {}
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
