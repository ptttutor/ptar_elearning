import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { validateItemCoupon } from "@/lib/api/coupons"
import { createOrder } from "@/lib/api/orders"
import { fetchMockExamById } from "@/features/checkout/api/fetch-mock-exam"
import { checkMockExamAccess } from "@/features/checkout/api/check-mock-exam-access"
import type { CheckoutMockExam } from "@/features/checkout/types"

export function useMockExamCheckout(id: string) {
  const router = useRouter()
  const search = useSearchParams()
  const { isAuthenticated, user, loading: authLoading } = useAuth()

  const couponFromQuery = (search.get("coupon") || "").trim()
  const authUserId = (user as any)?.id ?? null

  const [exam, setExam] = useState<CheckoutMockExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)

  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const lastAutoAppliedCoupon = useRef<string | null>(null)

  useEffect(() => {
    if (!couponFromQuery) {
      lastAutoAppliedCoupon.current = null
      return
    }
    setCouponCode(couponFromQuery)
    setDiscount(0)
    setCouponError(null)
    lastAutoAppliedCoupon.current = null
  }, [couponFromQuery])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await fetchMockExamById(id)
        if (active) setExam(data)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    let abort = false
    ;(async () => {
      if (authLoading) {
        setCheckingAccess(true)
        return
      }
      if (!isAuthenticated || !id) {
        setCheckingAccess(false)
        return
      }
      setCheckingAccess(true)
      const hasAccess = await checkMockExamAccess(id)
      if (!abort && hasAccess) {
        router.replace(`/mock-exams/${encodeURIComponent(id)}`)
        return
      }
      if (!abort) setCheckingAccess(false)
    })()
    return () => {
      abort = true
    }
  }, [id, isAuthenticated, authLoading, router])

  const price = useMemo(() => {
    if (!exam) return 0
    if ((exam.price ?? 0) === 0) return 0
    const original = Number(exam.price || 0)
    const d = exam.discountPrice
    if (d != null && d < original) return Number(d)
    return original
  }, [exam])

  const finalTotal = Math.max(0, (price || 0) - (discount || 0))

  const validateCoupon = useCallback(
    async (code: string) => {
      if (!exam) return
      if (!code) {
        setCouponError("กรอกรหัสคูปอง")
        setDiscount(0)
        return
      }
      try {
        setValidatingCoupon(true)
        setCouponError(null)
        const { discount: nextDiscount } = await validateItemCoupon({
          code,
          userId: authUserId ?? "guest",
          itemType: "mock_exam",
          itemId: exam.id,
          subtotal: price,
        })
        setDiscount(nextDiscount)
      } catch (e: any) {
        setCouponError(e?.message ?? "ใช้คูปองไม่สำเร็จ")
        setDiscount(0)
      } finally {
        setValidatingCoupon(false)
      }
    },
    [exam, price, authUserId]
  )

  const applyCoupon = () => void validateCoupon(couponCode)

  useEffect(() => {
    if (!couponFromQuery) return
    if (!exam) return
    if (!couponCode) return
    if (price <= 0) return
    if (lastAutoAppliedCoupon.current === couponFromQuery) return
    lastAutoAppliedCoupon.current = couponFromQuery
    void validateCoupon(couponFromQuery)
  }, [couponFromQuery, exam, couponCode, price, validateCoupon])

  const confirmOrder = async () => {
    if (!exam) return
    if (!isAuthenticated) {
      router.push(`/mock-exams/${encodeURIComponent(id)}`)
      return
    }
    try {
      setCreating(true)
      const { orderId } = await createOrder({
        userId: authUserId,
        items: [{ itemType: "MOCK_EXAM", itemId: exam.id, title: exam.title, quantity: 1, unitPrice: price }],
        couponCode: couponCode || undefined,
      })
      router.push(`/order-success/${encodeURIComponent(orderId)}`)
    } catch (e: any) {
      setCouponError(e?.message || "สร้างคำสั่งซื้อไม่สำเร็จ")
    } finally {
      setCreating(false)
    }
  }

  return {
    router,
    exam,
    loading,
    error,
    checkingAccess,
    couponCode,
    setCouponCode,
    discount,
    validatingCoupon,
    couponError,
    applyCoupon,
    price,
    finalTotal,
    creating,
    confirmOrder,
  }
}
