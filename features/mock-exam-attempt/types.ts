import type { MockQuestionView } from "@/components/mock-exam/MockQuestionField"

export type AttemptView = {
  attempt: { id: string; mode: "PRACTICE" | "REAL"; status: string; startedAt: string; totalMarks: number }
  mockExam: { id: string; title: string; subject: string; timeLimit: number | null; practiceUnlockCost: number }
  questions: MockQuestionView[]
  remainingSeconds: number | null
  practiceTokens: number | null
  practiceUnlockCost: number
}

export type AnswerValue = { optionId?: string; textAnswer?: string }
export type AnswerMap = Record<string, AnswerValue>

export function isAnswered(v?: AnswerValue): boolean {
  return !!v && (!!v.optionId || (!!v.textAnswer && v.textAnswer.trim().length > 0))
}
