import http from "@/lib/http"
import type { CourseProgress } from "@/features/profile-my-courses/types"

function toPercent(raw: unknown): number {
  let n = Number(raw) || 0
  if (n > 0 && n <= 1) n = n * 100
  return Math.max(0, Math.min(100, Math.round(n)))
}

export async function fetchCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
  try {
    const res = await http.get(`/api/progress`, { params: { userId, courseId } })
    const json = res.data || {}
    const raw = json?.data ?? json
    const percent = toPercent(raw?.percent ?? raw?.progress ?? 0)
    const complete = Boolean(raw?.complete ?? percent >= 100)
    return { percent, complete }
  } catch {
    return { percent: 0, complete: false }
  }
}

export { toPercent }
