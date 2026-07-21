import type { CheckoutCourse } from "@/features/checkout/types"

export async function fetchCourseById(id: string): Promise<CheckoutCourse> {
  const res = await fetch(`/api/courses/${encodeURIComponent(id)}`, { cache: "no-store" })
  const json = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json.data
}
