"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { useBookData } from "@/features/book-detail/hooks/use-book-data"
import { useBookPurchaseStatus } from "@/features/book-detail/hooks/use-book-purchase-status"
import { useBookReviews } from "@/features/book-detail/hooks/use-book-reviews"
import { BookHero } from "@/features/book-detail/components/book-hero"
import { PurchaseCard } from "@/features/book-detail/components/purchase-card"
import { ReviewsSection } from "@/features/book-detail/components/reviews-section"
import { ReviewDialog } from "@/features/book-detail/components/review-dialog"
import type { Ebook } from "@/features/book-detail/types"

export function BookDetailClient({ id, initial }: { id: string; initial: Ebook | null }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { addItem, items: cartItems, syncing: cartSyncing } = useCart()

  const { book, loading, error } = useBookData(id, initial)
  const [couponCode, setCouponCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewRestriction, setReviewRestriction] = useState<string | null>(null)

  const inCart = useMemo(() => cartItems.some((item) => item.itemType === "EBOOK" && String(item.itemId) === String(id)), [cartItems, id])

  const hasPurchased = useBookPurchaseStatus((user as any)?.id, id, isAuthenticated)
  const { reviews, reviewsLoading, reviewsError, hasMoreReviews, averageRating, totalReviews, postingReview, loadMore, submitReview } = useBookReviews(id)

  const hasDiscount = !!(book && book.discountPrice != null && book.discountPrice < book.price)
  const effectivePrice = book ? (hasDiscount ? (book.discountPrice as number) : book.price) : 0

  const goCheckout = () => {
    const q = couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : ""
    router.push(`/checkout/ebook/${encodeURIComponent(id)}${q}`)
  }

  const openReviewDialog = () => {
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (!hasPurchased) {
      setReviewRestriction("ต้องซื้อหนังสือเล่มนี้ก่อนจึงจะสามารถรีวิวได้")
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
    if (!hasPurchased) {
      setReviewRestriction("ต้องซื้อหนังสือเล่มนี้ก่อนจึงจะสามารถรีวิวได้")
      setReviewDialogOpen(false)
      return
    }
    const ok = await submitReview({ userId: (user as any).id, name: (user as any).name, rating: reviewRating, title: reviewTitle, comment: reviewComment })
    if (ok) {
      setReviewRestriction(null)
      setReviewDialogOpen(false)
      setReviewTitle("")
      setReviewComment("")
      setReviewRating(5)
    }
  }

  const handleAddToCart = async () => {
    if (!book) return
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (inCart) return
    try {
      setAddingToCart(true)
      await addItem({ itemType: "EBOOK", itemId: book.id, title: book.title, unitPrice: effectivePrice })
    } catch (error) {
      console.error("add ebook to cart error", error)
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-0 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <Link href="/books">
              <Button variant="outline" className="gap-2 rounded-xl border-gray-200 shadow-sm hover:shadow">
                <ArrowLeft className="h-4 w-4" />
                กลับไปหน้าหนังสือทั้งหมด
              </Button>
            </Link>
          </div>

          {loading && <div className="text-center text-gray-600">กำลังโหลด...</div>}
          {!loading && error && <div className="text-center text-red-600">เกิดข้อผิดพลาด: {error}</div>}
          {!loading && !error && !book && <div className="text-center text-gray-600">ไม่พบบุ๊คนี้</div>}

          {!loading && !error && book && (
            <div className="grid lg:grid-cols-3 gap-10">
              <BookHero book={book} averageRating={averageRating} totalReviews={totalReviews} />

              <PurchaseCard
                price={book.price}
                discountPrice={book.discountPrice}
                hasDiscount={hasDiscount}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                creating={creating}
                onCheckout={() => {
                  if (!isAuthenticated) {
                    setLoginOpen(true)
                    return
                  }
                  setCreating(true)
                  goCheckout()
                }}
                inCart={inCart}
                addingToCart={addingToCart}
                cartSyncing={cartSyncing}
                onAddToCart={handleAddToCart}
              />

              <ReviewsSection
                reviews={reviews}
                reviewsLoading={reviewsLoading}
                reviewsError={reviewsError}
                hasMoreReviews={hasMoreReviews}
                reviewRestriction={reviewRestriction}
                onLoadMore={loadMore}
                onOpenReviewDialog={openReviewDialog}
              />
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

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
