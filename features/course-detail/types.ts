export type ApiCourse = {
  id: string
  title: string
  description: string
  price: number
  discountPrice?: number | null
  duration: string | null
  sampleVideo?: string | null
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
}

export type ApiChapterContent = { id: string; title: string; contentType?: string; order?: number }

export type ApiChapter = {
  id: string
  title: string
  order?: number
  isFreePreview?: boolean
  duration?: number | null
  contents?: ApiChapterContent[]
}

export type ApiReview = {
  id: string
  userId: string
  courseId?: string
  ebookId?: string
  rating: number
  title?: string
  comment?: string
  createdAt: string
  user?: { id: string; name: string; email?: string; avatarUrl?: string }
}

export type ReviewsStats = { totalReviews?: number; averageRating?: number }
