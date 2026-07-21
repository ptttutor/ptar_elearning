import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/features/book-detail/components/star-rating"
import type { ApiReview } from "@/features/book-detail/types"

type ReviewsSectionProps = {
  reviews: ApiReview[]
  reviewsLoading: boolean
  reviewsError: string | null
  hasMoreReviews: boolean
  reviewRestriction: string | null
  onLoadMore: () => void
  onOpenReviewDialog: () => void
}

export function ReviewsSection({ reviews, reviewsLoading, reviewsError, hasMoreReviews, reviewRestriction, onLoadMore, onOpenReviewDialog }: ReviewsSectionProps) {
  return (
    <div className="order-3 lg:order-3 lg:col-span-2">
      <Card className="rounded-2xl border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">รีวิวจากผู้อ่าน</CardTitle>
            <Button variant="outline" className="rounded-xl" onClick={onOpenReviewDialog}>
              เขียนรีวิว
            </Button>
          </div>
          {reviewRestriction && <div className="text-sm text-red-600 mt-2">{reviewRestriction}</div>}
        </CardHeader>
        <CardContent className="pt-2">
          {reviewsError && <div className="text-red-600 text-sm mb-3">{reviewsError}</div>}
          {reviews.length === 0 && !reviewsLoading && <div className="text-gray-500">ยังไม่มีรีวิว</div>}
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 p-4 bg-white/90 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.rating} readOnly size="h-4 w-4" />
                      <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString("th-TH")}</div>
                    </div>
                    {r.title && <div className="font-medium mt-1">{r.title}</div>}
                    {r.comment && <div className="text-gray-700 mt-1">{r.comment}</div>}
                    <div className="text-xs text-gray-500 mt-2">โดย {r.user?.name || "ผู้ใช้"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {hasMoreReviews ? (
              <Button variant="outline" className="rounded-xl" disabled={reviewsLoading} onClick={onLoadMore}>
                {reviewsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> กำลังโหลด...
                  </>
                ) : (
                  "โหลดเพิ่มเติม"
                )}
              </Button>
            ) : (
              <div className="text-sm text-gray-500">ไม่มีรีวิวเพิ่มเติม</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
