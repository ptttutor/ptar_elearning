import http from "@/lib/http"
import type { MyCoursesResponse, PaidCourse } from "@/features/profile-my-courses/types"

export async function fetchMyCourses(userId: string): Promise<PaidCourse[]> {
  const res = await http.get(`/api/my-courses`, { params: { userId, includeCompleted: true } })
  const json: MyCoursesResponse = res.data || { success: false, courses: [], count: 0 }
  if (res.status < 200 || res.status >= 300 || json.success === false) {
    throw new Error((json as any)?.error || "โหลดคอร์สไม่สำเร็จ")
  }
  return json.courses || []
}
