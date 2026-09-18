import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useSchoolField } from "@/hooks/use-school-field"
import { validateItemCoupon } from "@/lib/api/coupons"
import { createOrder } from "@/lib/api/orders"
import { fetchFlashcardDeckForCheckout } from "@/features/checkout/api/fetch-flashcard-deck"
import type { CheckoutFlashcardDeck } from "@/features/checkout/types"

/**
 * Single-deck purchase, same shape as the mock-exam checkout: entitlement
 * (not "has a non-cancelled order") decides whether checkout is still needed,
 * and a deck the user already owns (or that turns out to be free) skips
 * straight to studying.
 */
export function useFlashcardDeckCheckout(id: string) {
  const router = useRouter()
  const search = useSearchParams()
  const { isAuthenticated, user, loading: authLoading } = useAuth()

  const couponFromQuery = (search.get("coupon") || "").trim()
  const authUserId = (user as any)?.id ?? null

  const [deck, setDeck] = useState<CheckoutFlashcardDeck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const lastAutoAppliedCoupon = useRef<string | null>(null)

  const { school, schoolInput, setSchoolInput, validateSchool, onSaved: onSchoolSaved } = useSchoolField()

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
    ;(async () => {
      if (authLoading || !id) return
      if (!isAuthenticated) {
        router.replace("/flashcards")
        return
      }
      try {
        setLoading(true)
        const data = await fetchFlashcardDeckForCheckout(id)
        if (!active) return
        if (data.hasAccess) {
          router.replace(`/flashcards/${encodeURIComponent(id)}`)
          return
        }
        setDeck(data)
      } catch (e: any) {
        if (active) setError(e?.response?.data?.error || e?.message || "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isAuthenticated, authLoading, router])

  const price = useMemo(() => {
    if (!deck) return 0
    const original = Number(deck.price || 0)
    if (original === 0) return 0
    const d = deck.discountPrice
    if (d != null && d < original) return Number(d)
    return original
  }, [deck])

  const finalTotal = Math.max(0, (price || 0) - (discount || 0))

  const validateCoupon = useCallback(
    async (code: string) => {
      if (!deck) return
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
          itemType: "flashcard_deck",
          itemId: deck.id,
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
    [deck, price, authUserId]
  )

  const applyCoupon = () => void validateCoupon(couponCode)

  useEffect(() => {
    if (!couponFromQuery) return
    if (!deck) return
    if (!couponCode) return
    if (price <= 0) return
    if (lastAutoAppliedCoupon.current === couponFromQuery) return
    lastAutoAppliedCoupon.current = couponFromQuery
    void validateCoupon(couponFromQuery)
  }, [couponFromQuery, deck, couponCode, price, validateCoupon])

  const confirmOrder = async () => {
    if (!deck) return
    if (!isAuthenticated) {
      router.push("/flashcards")
      return
    }
    const schoolCheck = validateSchool()
    if (!schoolCheck.ok) {
      setCouponError(schoolCheck.error)
      return
    }
    try {
      setCreating(true)
      setCouponError(null)
      const { orderId } = await createOrder({
        userId: authUserId,
        items: [{ itemType: "FLASHCARD_DECK", itemId: deck.id, title: deck.title, quantity: 1, unitPrice: price }],
        couponCode: couponCode || undefined,
        school: schoolCheck.value,
      })
      if (schoolCheck.value) onSchoolSaved(schoolCheck.value)
      router.push(`/order-success/${encodeURIComponent(orderId)}`)
    } catch (e: any) {
      setCouponError(e?.message || "สร้างคำสั่งซื้อไม่สำเร็จ")
    } finally {
      setCreating(false)
    }
  }

  return {
    router,
    deck,
    loading,
    error,
    couponCode,
    setCouponCode,
    validatingCoupon,
    couponError,
    applyCoupon,
    price,
    finalTotal,
    creating,
    confirmOrder,
    school,
    schoolInput,
    setSchoolInput,
  }
}
