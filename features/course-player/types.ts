export type Content = {
  id: string
  title: string
  contentType: string
  contentUrl: string
  order: number
  chapterId: string
  createdAt: string
}

export type Chapter = {
  id: string
  title: string
  order: number
  courseId: string
  createdAt: string
  contents: Content[]
}

export type CourseStats = {
  totalChapters: number
  totalContents: number
  totalEnrollments: number
}

export type Enrollment = {
  enrollmentId: string
  enrolledAt: string
  progress: number
  status: string
  viewedContentIds?: string[]
}

export type CourseDetail = {
  id: string
  title: string
  description: string
  price: number
  duration: number | null
  isFree: boolean
  status: string
  coverImageUrl: string
  createdAt: string
  updatedAt: string
  instructor: { id: string; name: string; email: string; image: string | null }
  category: { id: string; name: string; description: string | null }
  chapters: Chapter[]
  stats: CourseStats
  enrollment: Enrollment
}

export type CourseResponse = { success: boolean; course: CourseDetail; message?: string }

export type FlatItem = { index: number; content: Content; chapter: Chapter }
