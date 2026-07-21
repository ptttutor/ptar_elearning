import { useEffect, useMemo, useState } from "react"
import { fetchCourseReviews, postCourseReview } from "@/features/course-detail/api/reviews"
import type { ApiReview, ReviewsStats } from "@/features/course-detail/types"

const REVIEWS_LIMIT = 5

export function useCourseReviews(courseId: string) {
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)
  const [reviewsStats, setReviewsStats] = useState<ReviewsStats | null>(null)
  const [postingReview, setPostingReview] = useState(false)

  useEffect(() => {
    setReviews([])
    setReviewsPage(1)
    setHasMoreReviews(true)
    setReviewsError(null)
  }, [courseId])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!courseId || !hasMoreReviews || reviewsLoading) return
      try {
        setReviewsLoading(true)
        setReviewsError(null)
        const { reviews: list, stats, hasMore } = await fetchCourseReviews(courseId, reviewsPage, REVIEWS_LIMIT)
        if (active) {
          setReviews((prev) => [...prev, ...list])
          if (stats) setReviewsStats(stats)
          setHasMoreReviews(hasMore)
        }
      } catch (e: any) {
        if (active) setReviewsError(e?.message ?? "โหลดรีวิวไม่สำเร็จ")
      } finally {
        if (active) setReviewsLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, reviewsPage])

  const averageRating = useMemo(() => {
    if (reviewsStats?.averageRating != null) return Number(reviewsStats.averageRating)
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews, reviewsStats])

  const totalReviews = reviewsStats?.totalReviews ?? reviews.length

  const refresh = () => {
    setReviews([])
    setReviewsPage(1)
    setHasMoreReviews(true)
    setReviewsError(null)
    setReviewsStats(null)
  }

  const loadMore = () => setReviewsPage((p) => p + 1)

  const submitReview = async (payload: { userId: string; name?: string; rating: number; title: string; comment: string }) => {
    if (!payload.rating || !payload.title.trim() || !payload.comment.trim()) return false
    try {
      setPostingReview(true)
      const created = await postCourseReview({
        userId: payload.userId,
        courseId,
        rating: payload.rating,
        title: payload.title.trim(),
        comment: payload.comment.trim(),
      })
      const review: ApiReview =
        created ||
        ({
          id: `temp_${Date.now()}`,
          userId: payload.userId,
          courseId,
          rating: payload.rating,
          title: payload.title.trim(),
          comment: payload.comment.trim(),
          createdAt: new Date().toISOString(),
          user: { id: payload.userId, name: payload.name || "คุณผู้ใช้" },
        } satisfies ApiReview)
      setReviews((prev) => [review, ...prev])
      return true
    } catch {
      return false
    } finally {
      setPostingReview(false)
    }
  }

  return {
    reviews,
    reviewsLoading,
    reviewsError,
    hasMoreReviews,
    averageRating,
    totalReviews,
    postingReview,
    refresh,
    loadMore,
    submitReview,
  }
}
