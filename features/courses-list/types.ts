export enum GradeLevel {
  JUNIOR_HIGH = "JUNIOR_HIGH",
  SENIOR_HIGH = "SENIOR_HIGH",
}

export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
  [GradeLevel.JUNIOR_HIGH]: "ม.ต้น",
  [GradeLevel.SENIOR_HIGH]: "ม.ปลาย",
}

export type ApiCourse = {
  id: string
  title: string
  description: string
  price: number
  discountPrice?: number | null
  duration: string | null
  isFree: boolean
  status: string
  instructorId: string
  categoryId: string
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
  instructor?: { id: string; name: string; email: string }
  category?: { id: string; name: string; description?: string }
  _count?: { enrollments: number; chapters: number }
  subject?: string | null
  gradeLevel?: GradeLevel | null
}

export type ApiResponse = {
  success: boolean
  data: ApiCourse[]
  pagination?: { page?: number; limit?: number; total?: number; totalPages?: number }
}

export type SubjectOption = { id: string; name: string }
