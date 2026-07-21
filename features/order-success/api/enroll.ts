import { authHeaders } from "@/lib/auth-headers"

async function postJson(url: string, payload: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  })
  const text = await res.text().catch(() => "")
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {}
  const okLike = res.ok && json?.success !== false
  if (!okLike) {
    throw new Error(json?.error || json?.message || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }
  return json
}

/** Tries the singular endpoint first, falls back to the plural one. */
export async function enrollUser(userId: string, courseId: string, orderId?: string) {
  const payload = { userId, courseId, orderId }
  try {
    if (process.env.NODE_ENV !== "production") console.log("[Enroll] try /api/enrollment", payload)
    return await postJson("/api/enrollment", payload)
  } catch (e1: any) {
    if (process.env.NODE_ENV !== "production") console.warn("[Enroll] fallback /api/enrollments →", e1?.message)
    return await postJson("/api/enrollments", payload)
  }
}

export async function checkEnrollmentExists(userId: string, courseId: string): Promise<boolean> {
  const res = await fetch(
    `/api/enrollments?userId=${encodeURIComponent(userId)}&courseId=${encodeURIComponent(courseId)}`,
    { cache: "no-store", headers: authHeaders() }
  )
  const json: any = await res.json().catch(() => ({}))
  return !!(json?.enrollment || json?.data || json?.id)
}
