export type Question = {
  id: string
  text?: string
  image?: string | null
  marks?: number | null
  type?: string
  options?: { id: string; text?: string }[]
}

export type ExamDetail = {
  id: string
  title: string
  description?: string | null
  examType?: string
  duration?: number | null
  timeLimit?: number | null
  totalQuestions: number
  totalMarks?: number | null
  passingMarks?: number | null
  attemptsAllowed?: number | null
  showResults?: boolean
  showAnswers?: boolean
  courseTitle?: string | null
  questions: Question[]
  status?: string | null
  canRetake?: boolean
  attemptId?: string
  startedAt?: string | null
}

export type ExamDetailResponse = {
  success: boolean
  data?: ExamDetail
  exam?: ExamDetail
  error?: string
}

export type AnswerValue = { optionId?: string; textAnswer?: string }
export type AnswerMap = Record<string, AnswerValue>
