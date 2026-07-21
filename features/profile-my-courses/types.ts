export type ChapterSlim = {
  id: string
  title: string
  order?: number
  contents?: { id: string }[]
}

export type PaidCourse = {
  id: string
  title: string
  description?: string | null
  coverImageUrl?: string | null
  enrolledAt?: string | null
  paymentMethod?: string | null
  category?: { id: string; name: string }
  instructor?: { id: string; name: string }
  _count?: { chapters: number; enrollments: number }
  progress?: number | null
  chapters?: ChapterSlim[]
  enrollmentStatus?: string | null
  isExpire?: boolean | null
  expiresAt?: string | null
}

export type MyCoursesResponse = {
  success: boolean
  courses: PaidCourse[]
  count: number
  message?: string
}

export type CourseProgress = { percent: number; complete: boolean }
