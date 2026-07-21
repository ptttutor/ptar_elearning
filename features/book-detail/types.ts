export type Ebook = {
  id: string
  title: string
  description?: string | null
  author?: string | null
  isbn?: string | null
  price: number
  discountPrice?: number | null
  coverImageUrl?: string | null
  pageCount?: number | null
  format?: string | null
  language?: string | null
  publishedAt?: string | null
  isPhysical?: boolean
  category?: { id: string; name: string } | null
  averageRating?: number | null
}

export type ApiReview = {
  id: string
  userId: string
  ebookId?: string
  rating: number
  title?: string
  comment?: string
  createdAt: string
  user?: { id: string; name: string; email?: string; avatarUrl?: string }
}

export type ReviewsStats = { totalReviews?: number; averageRating?: number }
