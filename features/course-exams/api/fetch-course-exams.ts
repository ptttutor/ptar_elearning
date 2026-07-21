import type { ExamItem, ExamsResponse } from "@/features/course-exams/types"

export async function fetchCourseExams(courseId: string, userId: string): Promise<ExamItem[]> {
  const res = await fetch(`/api/my-courses/course/${encodeURIComponent(courseId)}/exams?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  })
  const json: ExamsResponse = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)

  const list: any[] = Array.isArray(json.exams)
    ? json.exams
    : Array.isArray(json?.data as any)
      ? (json.data as any)
      : Array.isArray((json?.data as any)?.exams)
        ? (json?.data as any)?.exams
        : []

  return list.map((item: any) => ({
    ...item,
    type: item?.type || item?.examType,
    examType: item?.examType || item?.type,
    questionCount: item?.questionCount ?? item?.totalQuestions ?? null,
    timeLimit: item?.timeLimit ?? item?.timeLimitMinutes ?? null,
    duration: item?.duration ?? null,
    maxAttempts: item?.maxAttempts ?? item?.attempts ?? null,
  }))
}
