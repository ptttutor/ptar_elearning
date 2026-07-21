import { authHeaders } from "@/lib/auth-headers"
import type { ExamDetail, ExamDetailResponse, Question } from "@/features/exam-attempt/types"

export async function fetchExamAttempt(courseId: string, examId: string, userId: string): Promise<ExamDetail | null> {
  const res = await fetch(
    `/api/my-courses/course/${encodeURIComponent(courseId)}/exams/${encodeURIComponent(examId)}?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store", headers: authHeaders() }
  )
  const json: ExamDetailResponse = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)

  const payload: any = json.data || (json as any).exam || null
  if (!payload) return null

  const examInfo = payload.exam || payload
  const rawQuestions: any[] = Array.isArray(payload.questions) ? payload.questions : []

  const questions: Question[] = rawQuestions.map((q) => ({
    id: q.id,
    text: q.questionText ?? q.text ?? "",
    image: q.questionImage ?? q.image ?? null,
    marks: typeof q.marks === "number" ? q.marks : null,
    type: q.questionType ?? q.type,
    options: Array.isArray(q.options)
      ? q.options.map((opt: any) => ({ id: opt.id, text: opt.optionText ?? opt.text ?? opt.label ?? opt.id }))
      : [],
  }))

  return {
    id: examInfo?.id ?? String(examId),
    title: examInfo?.title ?? payload?.title ?? "ข้อสอบ",
    description: examInfo?.description ?? payload?.description ?? null,
    examType: examInfo?.examType ?? examInfo?.type,
    duration: examInfo?.duration ?? null,
    timeLimit: examInfo?.timeLimit ?? examInfo?.duration ?? examInfo?.timeLimitMinutes ?? null,
    totalQuestions: typeof payload.totalQuestions === "number" ? payload.totalQuestions : questions.length,
    totalMarks: typeof payload.totalMarks === "number" ? payload.totalMarks : (examInfo?.totalMarks ?? null),
    passingMarks: typeof payload.passingMarks === "number" ? payload.passingMarks : (examInfo?.passingMarks ?? null),
    attemptsAllowed: typeof payload.attemptsAllowed === "number" ? payload.attemptsAllowed : (examInfo?.attemptsAllowed ?? null),
    showResults: payload.showResults ?? examInfo?.showResults ?? undefined,
    showAnswers: payload.showAnswers ?? examInfo?.showAnswers ?? undefined,
    courseTitle: examInfo?.course?.title ?? payload?.course?.title ?? null,
    questions,
    status: payload.status ?? examInfo?.status ?? null,
    canRetake: payload.canRetake,
    attemptId: payload.attemptId,
    startedAt: payload.startedAt,
  }
}
