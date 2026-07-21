export type ApiMockExam = {
  id: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string | null
  timeLimit: number | null
  price: number
  discountPrice: number | null
  allowPracticeMode: boolean
  allowRealMode: boolean
  course?: { id: string; title: string } | null
  _count?: { questions: number }
}

export type ApiResponse = {
  success: boolean
  data: ApiMockExam[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export function effectivePrice(exam: ApiMockExam): number {
  if (!exam.price) return 0
  if (exam.discountPrice != null && exam.discountPrice < exam.price) return exam.discountPrice
  return exam.price
}
