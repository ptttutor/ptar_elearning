import { authHeaders } from "@/lib/auth-headers"
import type { AnswerMap, Question } from "@/features/exam-attempt/types"

export async function submitExamAttempt(
  courseId: string,
  examId: string,
  userId: string,
  questions: Question[],
  answers: AnswerMap
): Promise<{ attemptId: string | null }> {
  const payload = {
    userId,
    answers: questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id]?.optionId,
      textAnswer: answers[q.id]?.textAnswer,
    })),
  }
  const res = await fetch(`/api/my-courses/course/${encodeURIComponent(courseId)}/exams/${encodeURIComponent(examId)}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  })
  const text = await res.text().catch(() => "")
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {}
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || (text && text.slice(0, 200)) || `HTTP ${res.status}`)
  }
  const result = json?.result || json?.data || json
  return { attemptId: result?.attemptId || result?.id || null }
}
