import http from "@/lib/http"
import type { AnswerValue, AttemptView } from "@/features/mock-exam-attempt/types"

export async function fetchAttemptView(attemptId: string): Promise<AttemptView> {
  const res = await http.get(`/api/mock-attempts/${attemptId}`)
  if (!res.data?.success) throw new Error(res.data?.error || "โหลดข้อมูลไม่สำเร็จ")
  return res.data.data
}

export async function submitAttempt(attemptId: string): Promise<void> {
  const res = await http.post(`/api/mock-attempts/${attemptId}/submit`)
  if (!res.data?.success) throw new Error(res.data?.error || "ส่งข้อสอบไม่สำเร็จ")
}

export async function saveAttemptAnswer(
  attemptId: string,
  questionId: string,
  payload: AnswerValue
): Promise<{ isCorrect?: boolean; marksAwarded?: number } | null> {
  const res = await http.post(`/api/mock-attempts/${attemptId}/answers`, { questionId, ...payload })
  if (!res.data?.success) throw new Error(res.data?.error)
  const graded = res.data.data
  return graded?.isCorrect !== undefined ? graded : null
}

export async function unlockAttemptQuestion(attemptId: string, questionId: string) {
  const res = await http.post(`/api/mock-attempts/${attemptId}/questions/${questionId}/unlock`)
  if (!res.data?.success) throw new Error(res.data?.error || "ปลดล็อคไม่สำเร็จ")
  return res.data.data as { practiceTokens: number | null; question: any }
}
