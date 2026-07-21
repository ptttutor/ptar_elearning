/**
 * Host allowlist for the /api/proxy-* routes. These routes fetch a
 * caller-supplied URL server-side and stream it back, so without an
 * allowlist they're an open SSRF proxy — restrict them to the storage
 * hosts we actually serve course/exam files from.
 */
function allowedHosts(): string[] {
  const hosts = ["res.cloudinary.com"]
  try {
    if (process.env.R2_PUBLIC_DEV_URL) {
      hosts.push(new URL(process.env.R2_PUBLIC_DEV_URL).hostname)
    }
  } catch {}
  return hosts
}

export function isAllowedProxyTarget(target: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return false
  }
  if (parsed.protocol !== "https:") return false
  const host = parsed.hostname
  if (host.endsWith(".vercel-storage.com")) return true
  return allowedHosts().includes(host)
}
