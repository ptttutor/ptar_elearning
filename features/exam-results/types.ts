export type AttemptSummary = {
  id: string
  examId: string | null
  examTitle: string | null
  courseId: string | null
  courseTitle: string | null
  score: number | null
  total: number | null
  status: string | null
  attemptedAt: string | null
  percentage: number | null
  passed: boolean | null
  totalQuestions: number | null
  correctAnswers: number | null
  durationMinutes: number | null
}

export type ResultsResponse = {
  success: boolean
  attempts?: AttemptSummary[]
  data?: { attempts?: AttemptSummary[]; pagination?: any } | AttemptSummary[]
  pagination?: any
  error?: string
}

export type ResultQuestion = {
  id: string
  text?: string | null
  image?: string | null
  type?: string | null
  marks?: number | null
  explanation?: string | null
  correctOptionId?: string | null
  correctTextAnswer?: string | null
  userOptionId?: string | null
  userTextAnswer?: string | null
  isCorrect?: boolean | null
  obtainedMarks?: number | null
  options?: { id: string; text?: string; isCorrect?: boolean | null }[]
}

export type AttemptResult = {
  id: string
  examId?: string | null
  examTitle?: string | null
  examDescription?: string | null
  courseId?: string | null
  courseTitle?: string | null
  score?: number | null
  total?: number | null
  status?: string | null
  percentage?: number | null
  passed?: boolean | null
  startedAt?: string | null
  completedAt?: string | null
  attemptedAt?: string | null
  totalQuestions?: number | null
  correctAnswers?: number | null
  questions?: ResultQuestion[]
}

export type ResultResponse = { success: boolean; result?: AttemptResult; data?: AttemptResult; error?: string }
