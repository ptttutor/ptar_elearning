import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useSchoolField } from "@/hooks/use-school-field"
import { validateItemCoupon } from "@/lib/api/coupons"
import { createOrder, findExistingOrder } from "@/lib/api/orders"
import { shippingAddressSchema, type ShippingAddress } from "@/lib/schemas/shipping-address.schema"

/**
 * Shared checkout logic for "buy one item directly, skipping the cart" —
 * course and ebook checkout are otherwise ~100% identical: fetch the item,
 * guard against paying twice, validate a coupon, optionally collect a
 * shipping address, create the order. Mock exam checkout is NOT built on
 * this hook — it has no shipping/school step and uses a real entitlement
 * check instead of the order-lookup guard (see use-mock-exam-checkout.ts).
 */

type SingleCheckoutItem = {
  id: string
  title: string
  price: number
  discountPrice?: number | null
  isFree?: boolean
  isPhysical?: boolean
}

const EMPTY_SHIPPING: ShippingAddress = {
  name: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
}

export function useSingleItemCheckout<T extends SingleCheckoutItem>({
  id,
  itemType,
  fetchItem,
  redirectWhenUnauthenticated,
}: {
  id: string
  itemType: "COURSE" | "EBOOK"
  fetchItem: (id: string) => Promise<T>
  redirectWhenUnauthenticated: string
}) {
  const router = useRouter()
  const search = useSearchParams()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { school, schoolInput, setSchoolInput, validateSchool, onSaved: onSchoolSaved } = useSchoolField()

  const couponFromQuery = (search.get("coupon") || "").trim()
  const authUserId = (user as any)?.id ?? null

  const [item, setItem] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const lastAutoAppliedCoupon = useRef<string | null>(null)

  const [shipping, setShipping] = useState<ShippingAddress>(EMPTY_SHIPPING)
  const [shippingError, setShippingError] = useState<string | null>(null)

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
        const data = await fetchItem(id)
        if (active) setItem(data)
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
  }, [id, fetchItem])

  const [checkingExisting, setCheckingExisting] = useState(true)
  useEffect(() => {
    let abort = false
    ;(async () => {
      if (authLoading) {
        setCheckingExisting(true)
        return
      }
      if (!isAuthenticated || !id || !authUserId) {
        setCheckingExisting(false)
        return
      }
      setCheckingExisting(true)
      const existing = await findExistingOrder(authUserId, itemType, id)
      if (!abort && existing) {
        router.replace(`/order-success/${encodeURIComponent(existing.id)}`)
        return
      }
      if (!abort) setCheckingExisting(false)
    })()
    return () => {
      abort = true
    }
  }, [id, isAuthenticated, authLoading, authUserId, itemType, router])

  const price = useMemo(() => {
    if (!item) return 0
    if (item.isFree || (item.price ?? 0) === 0) return 0
    const original = Number(item.price || 0)
    const d = item.discountPrice
    if (d != null && d < original) return Number(d)
    return original
  }, [item])

  const finalTotal = Math.max(0, (price || 0) - (discount || 0))

  const validateCoupon = useCallback(
    async (code: string) => {
      if (!item) return
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
          itemType: itemType.toLowerCase() as "course" | "ebook",
          itemId: item.id,
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
    [item, price, authUserId, itemType]
  )

  const applyCoupon = () => void validateCoupon(couponCode)

  useEffect(() => {
    if (!couponFromQuery) return
    if (!item) return
    if (!couponCode) return
    if (price <= 0) return
    if (lastAutoAppliedCoupon.current === couponFromQuery) return
    lastAutoAppliedCoupon.current = couponFromQuery
    void validateCoupon(couponFromQuery)
  }, [couponFromQuery, item, couponCode, price, validateCoupon])

  const confirmOrder = async () => {
    if (!item) return
    if (!isAuthenticated) {
      router.push(redirectWhenUnauthenticated)
      return
    }
    setShippingError(null)
    try {
      const schoolCheck = validateSchool()
      if (!schoolCheck.ok) {
        setShippingError(schoolCheck.error)
        return
      }
      if (item.isPhysical) {
        const validation = shippingAddressSchema.safeParse(shipping)
        if (!validation.success) {
          setShippingError(validation.error.issues[0]?.message ?? "ข้อมูลจัดส่งไม่ถูกต้อง")
          return
        }
      }

      setCreating(true)

      if (authUserId) {
        const existing = await findExistingOrder(authUserId, itemType, item.id)
        if (existing) {
          router.push(`/order-success/${encodeURIComponent(existing.id)}`)
          return
        }
      }

      const { orderId } = await createOrder({
        userId: authUserId,
        items: [{ itemType, itemId: item.id, title: item.title, quantity: 1, unitPrice: price }],
        couponCode: couponCode || undefined,
        shippingAddress: item.isPhysical ? shipping : undefined,
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
    item,
    loading,
    error,
    checkingExisting,
    couponCode,
    setCouponCode,
    discount,
    validatingCoupon,
    couponError,
    applyCoupon,
    price,
    finalTotal,
    school,
    schoolInput,
    setSchoolInput,
    shipping,
    setShipping,
    shippingError,
    creating,
    confirmOrder,
  }
}
