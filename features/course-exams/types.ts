export type ExamItem = {
  id: string
  title?: string
  description?: string | null
  type?: string
  examType?: string
  timeLimit?: number | null
  timeLimitMinutes?: number | null
  duration?: number | null
  questionCount?: number | null
  totalQuestions?: number | null
  attempts?: number | null
  maxAttempts?: number | null
  status?: string | null
  canRetake?: boolean
  lastAttempt?: string | null
  createdAt?: string | null
}

export type ExamsResponse = {
  success: boolean
  exams?: ExamItem[]
  data?: { exams?: ExamItem[] } | ExamItem[]
  error?: string
}
