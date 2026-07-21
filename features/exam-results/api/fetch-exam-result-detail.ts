import type { AttemptResult, ResultResponse } from "@/features/exam-results/types"

type RawQuestionOption = { id?: string; optionText?: string; text?: string; label?: string; isCorrect?: boolean | null }

export async function fetchExamResultDetail(attemptId: string, userId: string): Promise<AttemptResult | null> {
  const res = await fetch(`/api/my-courses/exam-results/${encodeURIComponent(attemptId)}?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  })
  const json: ResultResponse = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)

  const data: any = json.result || json.data || null
  if (!data) return null

  const exam = data.exam ?? {}
  const course = exam.course ?? {}

  return {
    id: String(data.id ?? ""),
    examId: exam?.id ?? null,
    examTitle: exam?.title ?? null,
    examDescription: exam?.description ?? null,
    courseId: course?.id ?? null,
    courseTitle: course?.title ?? null,
    score: typeof data.obtainedMarks === "number" ? data.obtainedMarks : null,
    total: typeof data.totalMarks === "number" ? data.totalMarks : null,
    status: data.status ?? null,
    percentage: typeof data.percentage === "number" ? data.percentage : null,
    passed: typeof data.passed === "boolean" ? data.passed : null,
    startedAt: data.startedAt ?? null,
    completedAt: data.completedAt ?? null,
    attemptedAt: data.completedAt ?? data.startedAt ?? null,
    totalQuestions: typeof data.totalQuestions === "number" ? data.totalQuestions : null,
    correctAnswers: typeof data.correctAnswers === "number" ? data.correctAnswers : null,
    questions: Array.isArray(data.answers)
      ? data.answers.map((answer: any) => {
          const question = answer.question ?? {}
          const rawOptions: RawQuestionOption[] = Array.isArray(question.options) ? question.options : []
          const options = rawOptions.map((opt) => ({
            id: String(opt.id ?? ""),
            text: typeof opt.optionText === "string" ? opt.optionText : typeof opt.text === "string" ? opt.text : typeof opt.label === "string" ? opt.label : String(opt.id ?? ""),
            isCorrect: typeof opt.isCorrect === "boolean" ? opt.isCorrect : null,
          }))
          const correctOption = options.find((opt) => opt.isCorrect)
          const studentAnswer = answer.studentAnswer ?? {}

          return {
            id: String(answer.questionId ?? question.id ?? ""),
            text: question.questionText ?? answer.questionText ?? null,
            image: question.questionImage ?? answer.questionImage ?? null,
            type: question.questionType ?? answer.questionType ?? null,
            marks: typeof question.marks === "number" ? question.marks : typeof answer.marks === "number" ? answer.marks : null,
            explanation: question.explanation ?? answer.explanation ?? null,
            correctOptionId: correctOption?.id ?? null,
            correctTextAnswer: null,
            userOptionId: studentAnswer.optionId ?? null,
            userTextAnswer: studentAnswer.textAnswer ?? null,
            isCorrect: typeof studentAnswer.isCorrect === "boolean" ? studentAnswer.isCorrect : null,
            obtainedMarks: typeof studentAnswer.obtainedMarks === "number" ? studentAnswer.obtainedMarks : null,
            options,
          }
        })
      : [],
  }
}
