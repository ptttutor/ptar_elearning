import type { AttemptSummary, ResultsResponse } from "@/features/exam-results/types"

export async function fetchExamResults(userId: string): Promise<AttemptSummary[]> {
  const res = await fetch(`/api/my-courses/exam-results?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
  const json: ResultsResponse = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)

  const list: any[] = Array.isArray(json.attempts)
    ? json.attempts
    : Array.isArray((json?.data as any)?.attempts)
      ? (json?.data as any)?.attempts
      : Array.isArray(json?.data as any)
        ? (json.data as any)
        : []

  return list.map((item: any) => {
    const exam = item.exam ?? {}
    const course = exam.course ?? {}
    return {
      id: String(item.id ?? ""),
      examId: exam?.id ?? null,
      examTitle: exam?.title ?? null,
      courseId: course?.id ?? null,
      courseTitle: course?.title ?? null,
      score: typeof item.obtainedMarks === "number" ? item.obtainedMarks : null,
      total: typeof item.totalMarks === "number" ? item.totalMarks : null,
      status: item.status ?? null,
      attemptedAt: item.completedAt ?? item.startedAt ?? null,
      percentage: typeof item.percentage === "number" ? item.percentage : null,
      passed: typeof item.passed === "boolean" ? item.passed : null,
      totalQuestions: typeof item.totalQuestions === "number" ? item.totalQuestions : null,
      correctAnswers: typeof item.correctAnswers === "number" ? item.correctAnswers : null,
      durationMinutes: typeof item.duration === "number" ? item.duration : null,
    }
  })
}
