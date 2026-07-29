import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { ApiChapter, ApiCourse } from "@/features/course-detail/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }

type PurchaseCardProps = {
  course: ApiCourse
  chapters: ApiChapter[]
  isEnrolled: boolean
  effectivePrice: number
  originalPrice: number
  hasDiscount: boolean
  couponCode: string
  onCouponCodeChange: (value: string) => void
  onApplyCoupon: () => void
  validatingCoupon: boolean
  couponError: string | null
  discount: number
  finalTotal: number
  onEnroll: () => void
  inCart: boolean
  addingToCart: boolean
  cartSyncing: boolean
  onAddToCart: () => void
}

export function PurchaseCard({
  course,
  chapters,
  isEnrolled,
  effectivePrice,
  originalPrice,
  hasDiscount,
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  validatingCoupon,
  couponError,
  discount,
  finalTotal,
  onEnroll,
  inCart,
  addingToCart,
  cartSyncing,
  onAddToCart,
}: PurchaseCardProps) {
  return (
    <motion.div className="lg:sticky lg:top-8" variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
      <Card className="rounded-3xl shadow-lg ring-1 ring-black/5">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
              {effectivePrice === 0 ? (
                <span className="text-2xl sm:text-3xl font-extrabold text-green-600 tracking-tight">ฟรี</span>
              ) : hasDiscount ? (
                <>
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">฿{(originalPrice || 0).toLocaleString()}</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">฿{(effectivePrice || 0).toLocaleString()}</span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">฿{(effectivePrice || 0).toLocaleString()}</span>
              )}
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ระยะเวลา</span>
              <span className="font-medium">{course.duration ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">บทเรียน</span>
              <span className="font-medium">{chapters.length} บทเรียน</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">นักเรียน</span>
              <span className="font-medium">{course._count?.enrollments ?? 0} คน</span>
            </div>

            {effectivePrice > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-sm font-medium">คูปองส่วนลด</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="กรอกรหัสคูปอง" value={couponCode} onChange={(e) => onCouponCodeChange(e.target.value)} className="h-10 rounded-lg" />
                  <Button variant="outline" disabled={validatingCoupon} onClick={onApplyCoupon} className="rounded-lg flex-shrink-0">
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "ใช้คูปอง"}
                  </Button>
                </div>
                {couponError && <div className="text-xs text-destructive">{couponError}</div>}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>ส่วนลดคูปอง</span>
                    <span>-฿{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-1">
                  <span>ยอดสุทธิ</span>
                  <span>฿{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isEnrolled ? (
              <Link href={`/profile/my-courses/course/${course.id}/`}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg h-12 rounded-xl shadow hover:shadow-md transition">เข้าเรียนทันที</Button>
              </Link>
            ) : (
              <Button onClick={onEnroll} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg h-12 rounded-xl shadow hover:shadow-md transition">
                สมัครเรียนเลย
              </Button>
            )}
            <Button variant="outline" className="w-full rounded-xl h-12" disabled={addingToCart || cartSyncing || inCart} onClick={onAddToCart}>
              {inCart ? "อยู่ในตะกร้าแล้ว" : addingToCart || cartSyncing ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
