import { useState } from "react"
import { validateItemCoupon } from "@/lib/api/coupons"

export function useCourseCoupon(courseId: string, userId: string | undefined, effectivePrice: number) {
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const finalTotal = Math.max(0, (effectivePrice || 0) - (discount || 0))

  const applyCoupon = async () => {
    if (!couponCode) {
      setCouponError("กรอกรหัสคูปอง")
      return
    }
    try {
      setValidatingCoupon(true)
      setCouponError(null)
      const { discount: nextDiscount } = await validateItemCoupon({
        code: couponCode,
        userId: userId ?? "guest",
        itemType: "course",
        itemId: courseId,
        subtotal: effectivePrice,
      })
      setDiscount(nextDiscount)
    } catch (e: any) {
      setCouponError(e?.message ?? "ใช้คูปองไม่สำเร็จ")
      setDiscount(0)
    } finally {
      setValidatingCoupon(false)
    }
  }

  return { couponCode, setCouponCode, discount, validatingCoupon, couponError, finalTotal, applyCoupon }
}
