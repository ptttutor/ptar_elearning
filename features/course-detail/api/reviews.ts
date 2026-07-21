import type { ApiReview, ReviewsStats } from "@/features/course-detail/types"

export async function fetchCourseReviews(courseId: string, page: number, limit: number): Promise<{ reviews: ApiReview[]; stats?: ReviewsStats; hasMore: boolean }> {
  const url = `/api/reviews?courseId=${encodeURIComponent(courseId)}&page=${page}&limit=${limit}`
  const res = await fetch(url, { cache: "no-store" })
  const text = await res.text().catch(() => "")
  let json: any = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {}

  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }

  const list: ApiReview[] = Array.isArray(json?.data) ? json.data : Array.isArray(json?.data?.reviews) ? json.data.reviews : []
  const pagination = json?.data?.pagination
  const stats = json?.data?.stats

  const hasMore = pagination ? Number(pagination.page) < Number(pagination.totalPages) : list.length >= limit

  return { reviews: list, stats: stats ? { totalReviews: stats.totalReviews, averageRating: stats.averageRating } : undefined, hasMore }
}

export async function postCourseReview(payload: { userId: string; courseId: string; rating: number; title: string; comment: string }): Promise<ApiReview | null> {
  const res = await fetch(`/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json: { success: boolean; data?: ApiReview; error?: string } = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || "ส่งรีวิวไม่สำเร็จ")
  return json.data || null
}
