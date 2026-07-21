export type ApiExam = {
  id: string
  title: string
  description: string | null
  categoryId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string }
  _count?: { files: number }
}

export type ApiExamsResponse = {
  success?: boolean
  data?: ApiExam[]
  total?: number
  count?: number
  pagination?: { total?: number; page?: number; limit?: number }
  meta?: { total?: number; page?: number; limit?: number }
}

export type UiExam = {
  id: string
  title: string
  categoryId?: string
  categoryName: string
  year: number
  examType: string
}

export type ExamCategory = { id: string; name: string; color: string; type?: string }

export type ExamFile = { id?: string; name?: string; url: string; mime?: string; isDownload?: boolean }
