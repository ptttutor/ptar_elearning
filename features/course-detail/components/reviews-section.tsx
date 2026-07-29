import { motion } from "framer-motion"
import { Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/features/course-detail/components/star-rating"
import type { ApiReview } from "@/features/course-detail/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }

function formatThaiDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

type ReviewsSectionProps = {
  reviews: ApiReview[]
  reviewsLoading: boolean
  reviewsError: string | null
  hasMoreReviews: boolean
  averageRating: number
  totalReviews: number
  reviewRestriction: string | null
  onRefresh: () => void
  onLoadMore: () => void
  onOpenReviewDialog: () => void
}

export function ReviewsSection({
  reviews,
  reviewsLoading,
  reviewsError,
  hasMoreReviews,
  averageRating,
  totalReviews,
  reviewRestriction,
  onRefresh,
  onLoadMore,
  onOpenReviewDialog,
}: ReviewsSectionProps) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.25 }}>
      <Card className="rounded-3xl border-border shadow-sm">
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">รีวิวจากผู้เรียน</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-card-foreground">
                <Star className="h-5 w-5 text-primary fill-current" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5 จาก {totalReviews} รีวิว</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto sm:justify-end">
              <Button variant="outline" className="rounded-xl border-border" onClick={onRefresh}>
                รีเฟรช
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl" onClick={onOpenReviewDialog}>
                เขียนรีวิว
              </Button>
            </div>
            {reviewRestriction && <div className="text-sm text-destructive sm:w-full sm:basis-full">{reviewRestriction}</div>}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {reviewsError ? (
            <div className="text-destructive mb-3">{reviewsError}</div>
          ) : reviews.length === 0 && !reviewsLoading ? (
            <div className="text-muted-foreground">ยังไม่มีรีวิวสำหรับคอร์สนี้</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rv) => (
                <div key={rv.id} className="rounded-xl border border-border p-4 bg-card/90 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-foreground break-words">{rv.user?.name || "ผู้ใช้"}</div>
                        <span className="text-xs text-muted-foreground">• {formatThaiDate(rv.createdAt)}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating value={rv.rating} readOnly />
                      </div>
                      {rv.title && <div className="mt-2 text-foreground font-medium break-words">{rv.title}</div>}
                      {rv.comment && <p className="mt-1 text-muted-foreground whitespace-pre-wrap break-words">{rv.comment}</p>}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                {hasMoreReviews ? (
                  <Button variant="outline" className="w-full rounded-xl" disabled={reviewsLoading} onClick={onLoadMore}>
                    {reviewsLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลังโหลด...
                      </>
                    ) : (
                      "โหลดเพิ่มเติม"
                    )}
                  </Button>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">แสดงครบแล้ว</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
