import { authHeaders } from "@/lib/auth-headers"
import type { CourseDetail, CourseResponse } from "@/features/course-player/types"

export async function fetchCourseDetail(courseId: string, userId: string): Promise<CourseDetail> {
  const res = await fetch(`/api/my-courses/course/${courseId}?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
    headers: authHeaders(),
  })
  const json: CourseResponse = await res.json().catch(() => ({ success: false, course: null }) as unknown as CourseResponse)
  if (!res.ok || json.success === false) {
    throw new Error((json as any)?.error || "โหลดคอร์สไม่สำเร็จ")
  }
  return json.course
}
