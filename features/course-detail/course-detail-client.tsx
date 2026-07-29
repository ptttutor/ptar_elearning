"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { useCourseData } from "@/features/course-detail/hooks/use-course-data"
import { useIntroVideo } from "@/features/course-detail/hooks/use-intro-video"
import { useEnrollment } from "@/features/course-detail/hooks/use-enrollment"
import { useCourseReviews } from "@/features/course-detail/hooks/use-course-reviews"
import { useCourseCoupon } from "@/features/course-detail/hooks/use-course-coupon"
import { CourseDetailSkeleton } from "@/features/course-detail/components/course-detail-skeleton"
import { CourseHero } from "@/features/course-detail/components/course-hero"
import { ChaptersPanel } from "@/features/course-detail/components/chapters-panel"
import { PurchaseCard } from "@/features/course-detail/components/purchase-card"
import { ReviewsSection } from "@/features/course-detail/components/reviews-section"
import { ReviewDialog } from "@/features/course-detail/components/review-dialog"
import { EnrolledDialog } from "@/features/course-detail/components/enrolled-dialog"
import type { ApiChapter, ApiCourse } from "@/features/course-detail/types"

export function CourseDetailClient({ id, initial }: { id: string; initial: { course: ApiCourse | null; chapters: ApiChapter[] } }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { addItem, items: cartItems, syncing: cartSyncing } = useCart()

  const { course, chapters, loading, error } = useCourseData(id, initial)
  const [loginOpen, setLoginOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [enrolledOpen, setEnrolledOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewRestriction, setReviewRestriction] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")

  const inCart = useMemo(() => cartItems.some((item) => item.itemType === "COURSE" && String(item.itemId) === String(id)), [cartItems, id])

  useEffect(() => {
    if (chapters.length) {
      const first = chapters.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
      if (first && !activeChapterId) setActiveChapterId(first.id)
    } else {
      setActiveChapterId(null)
    }
  }, [chapters.length])

  const intro = useIntroVideo(course?.sampleVideo)
  const { isEnrolled, viewedIds, saving, totalContents, progressPercent, toggleContentViewed } = useEnrollment((user as any)?.id, id, isAuthenticated, chapters)

  const totalMinutes = useMemo(() => {
    if (typeof course?.duration === "number") return course.duration as any
    const sum = chapters.reduce((acc, c) => acc + (typeof c.duration === "number" ? c.duration : 0), 0)
    return sum > 0 ? sum : null
  }, [course?.duration, chapters])

  const originalPrice = course?.price ?? 0
  const discountedPrice = course?.discountPrice ?? null
  const effectivePrice = course?.isFree || originalPrice === 0 ? 0 : discountedPrice != null ? discountedPrice : originalPrice
  const hasDiscount = !course?.isFree && discountedPrice != null && discountedPrice < originalPrice

  const { couponCode, setCouponCode, discount, validatingCoupon, couponError, finalTotal, applyCoupon } = useCourseCoupon(id, (user as any)?.id, effectivePrice)
  const { reviews, reviewsLoading, reviewsError, hasMoreReviews, averageRating, totalReviews, postingReview, refresh, loadMore, submitReview } = useCourseReviews(id)

  useEffect(() => {
    if (isEnrolled) setReviewRestriction(null)
  }, [isEnrolled])

  useEffect(() => {
    if (isEnrolled) setEnrolledOpen(true)
  }, [isEnrolled])

  const openReviewDialog = () => {
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (!isEnrolled) {
      setReviewRestriction("ต้องซื้อคอร์สนี้ก่อนจึงจะสามารถรีวิวได้")
      return
    }
    setReviewRestriction(null)
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !(user as any)?.id) {
      setLoginOpen(true)
      return
    }
    if (!isEnrolled) {
      setReviewRestriction("ต้องซื้อคอร์สนี้ก่อนจึงจะสามารถรีวิวได้")
      setReviewDialogOpen(false)
      return
    }
    const ok = await submitReview({ userId: (user as any).id, name: (user as any).name, rating: reviewRating, title: reviewTitle, comment: reviewComment })
    if (ok) {
      setReviewDialogOpen(false)
      setReviewTitle("")
      setReviewComment("")
      setReviewRating(5)
    }
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    const q = couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : ""
    router.push(`/checkout/course/${encodeURIComponent(id)}${q}`)
  }

  const handleAddToCart = async () => {
    if (!course) return
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (inCart) return
    try {
      setAddingToCart(true)
      await addItem({ itemType: "COURSE", itemId: course.id, title: course.title, unitPrice: effectivePrice })
    } catch (error) {
      console.error("add to cart error", error)
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/courses">
              <Button variant="outline" className="gap-2 rounded-xl border-border shadow-sm hover:shadow transition-all hover:-translate-y-0.5">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">กลับไปหน้าคอร์สเรียนทั้งหมด</span>
                <span className="sm:hidden">คอร์สเรียนทั้งหมด</span>
              </Button>
            </Link>
          </div>

          {loading && <CourseDetailSkeleton />}
          {!loading && error && <div className="text-center text-destructive py-10">เกิดข้อผิดพลาด: {error}</div>}
          {!loading && !error && !course && <div className="text-center text-muted-foreground py-10">ไม่พบคอร์สนี้</div>}

          {!loading && !error && course && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-12">
              <section className="lg:col-span-2 space-y-8 order-1">
                <CourseHero
                  course={course}
                  chapters={chapters}
                  introSrc={intro.introSrc}
                  introPlayableSrc={intro.introPlayableSrc}
                  introFrameRef={intro.introFrameRef}
                  introSectionRef={intro.introSectionRef}
                  introReplayVisible={intro.introReplayVisible}
                  introEmbedKey={intro.introEmbedKey}
                  isIntroVimeo={intro.isIntroVimeo}
                  onIntroReplay={intro.handleIntroReplay}
                />

                <ChaptersPanel
                  chapters={chapters}
                  totalMinutes={totalMinutes}
                  totalContents={totalContents}
                  progressPercent={progressPercent}
                  saving={saving}
                  isEnrolled={isEnrolled}
                  viewedIds={viewedIds}
                  activeChapterId={activeChapterId}
                  onSetActiveChapter={setActiveChapterId}
                  onPreviewClick={() => intro.handlePreviewClick(course.sampleVideo)}
                  onToggleContentViewed={(contentId) => toggleContentViewed(contentId, () => setLoginOpen(true))}
                />
              </section>

              <aside className="lg:col-span-1 order-2 lg:order-3">
                <PurchaseCard
                  course={course}
                  chapters={chapters}
                  isEnrolled={isEnrolled}
                  effectivePrice={effectivePrice}
                  originalPrice={originalPrice}
                  hasDiscount={hasDiscount}
                  couponCode={couponCode}
                  onCouponCodeChange={setCouponCode}
                  onApplyCoupon={applyCoupon}
                  validatingCoupon={validatingCoupon}
                  couponError={couponError}
                  discount={discount}
                  finalTotal={finalTotal}
                  onEnroll={handleEnroll}
                  inCart={inCart}
                  addingToCart={addingToCart}
                  cartSyncing={cartSyncing}
                  onAddToCart={handleAddToCart}
                />
              </aside>

              <section id="reviewsSection" className="lg:col-span-3 order-4">
                <ReviewsSection
                  reviews={reviews}
                  reviewsLoading={reviewsLoading}
                  reviewsError={reviewsError}
                  hasMoreReviews={hasMoreReviews}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                  reviewRestriction={reviewRestriction}
                  onRefresh={refresh}
                  onLoadMore={loadMore}
                  onOpenReviewDialog={openReviewDialog}
                />
              </section>
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {course && <EnrolledDialog open={enrolledOpen} onOpenChange={setEnrolledOpen} courseId={course.id} onWriteReview={() => { setEnrolledOpen(false); setReviewDialogOpen(true) }} />}

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        rating={reviewRating}
        onRatingChange={setReviewRating}
        title={reviewTitle}
        onTitleChange={setReviewTitle}
        comment={reviewComment}
        onCommentChange={setReviewComment}
        posting={postingReview}
        onSubmit={handleSubmitReview}
      />
    </>
  )
}
