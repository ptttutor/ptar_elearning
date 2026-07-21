import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { useSchoolField } from "@/hooks/use-school-field"
import { validateCartCoupon } from "@/lib/api/coupons"
import { createOrder } from "@/lib/api/orders"
import { shippingAddressSchema, type ShippingAddress } from "@/lib/schemas/shipping-address.schema"

/**
 * The /checkout/cart confirm-and-pay step — distinct from
 * features/cart/hooks/use-cart-checkout.ts, which powers the /cart
 * basket-editing page (quantity +/-, remove). This hook is read-only on
 * items, adds the school field + auto-apply-coupon-from-query, and
 * redirects away if the cart is empty or the user isn't authenticated.
 */

const EMPTY_SHIPPING: ShippingAddress = {
  name: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
}

export function useCheckoutCart() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const { items, loading, itemCount, subtotal: cartSubtotal, refresh, syncing } = useCart()
  const { school, schoolInput, setSchoolInput, validateSchool, onSaved: onSchoolSaved } = useSchoolField()

  const [coverMap, setCoverMap] = useState<Record<string, string>>({})
  const [shipping, setShipping] = useState<ShippingAddress>(EMPTY_SHIPPING)
  const [shippingError, setShippingError] = useState<string | null>(null)

  const couponFromQuery = (searchParams?.get("coupon") || "").trim()
  const [couponCode, setCouponCode] = useState(couponFromQuery)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const autoAppliedCoupon = useRef<string | null>(null)

  useEffect(() => {
    if (couponFromQuery && couponFromQuery !== couponCode) {
      setCouponCode(couponFromQuery)
    }
  }, [couponFromQuery, couponCode])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/cart")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) void refresh()
  }, [isAuthenticated, refresh])

  const subtotal = useMemo(() => {
    if (cartSubtotal && !Number.isNaN(cartSubtotal)) return cartSubtotal
    return items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0)
  }, [cartSubtotal, items])

  const anyPhysical = useMemo(
    () => items.some((item) => item.itemType.toUpperCase().includes("PHYSICAL") || Boolean((item as any)?.isPhysical)),
    [items]
  )

  const totalAfterDiscount = useMemo(() => Math.max(0, subtotal - couponDiscount), [subtotal, couponDiscount])

  useEffect(() => {
    let cancelled = false
    const loadCovers = async () => {
      const courseIds = new Set<string>()
      const ebookIds = new Set<string>()

      items.forEach((item) => {
        if (item.coverImageUrl) return
        const key = `${item.itemType}:${item.itemId}`
        if (coverMap[key]) return
        if (String(item.itemType).toUpperCase() === "COURSE") {
          if (item.itemId) courseIds.add(item.itemId)
        } else if (String(item.itemType).toUpperCase() === "EBOOK") {
          if (item.itemId) ebookIds.add(item.itemId)
        }
      })

      try {
        if (courseIds.size) {
          const results = await Promise.all(
            Array.from(courseIds).map(async (courseId) => {
              try {
                const res = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, { cache: "no-store" })
                const json = await res.json().catch(() => ({}))
                return [courseId, json?.data?.coverImageUrl || ""] as const
              } catch {
                return [courseId, ""] as const
              }
            })
          )
          if (!cancelled) {
            setCoverMap((prev) => {
              const next = { ...prev }
              results.forEach(([id, cover]) => {
                if (cover) next[`COURSE:${id}`] = cover
              })
              return next
            })
          }
        }

        if (ebookIds.size) {
          const results = await Promise.all(
            Array.from(ebookIds).map(async (ebookId) => {
              try {
                const res = await fetch(`/api/ebooks/${encodeURIComponent(ebookId)}`, { cache: "no-store" })
                const json = await res.json().catch(() => ({}))
                return [ebookId, json?.data?.coverImageUrl || ""] as const
              } catch {
                return [ebookId, ""] as const
              }
            })
          )
          if (!cancelled) {
            setCoverMap((prev) => {
              const next = { ...prev }
              results.forEach(([id, cover]) => {
                if (cover) next[`EBOOK:${id}`] = cover
              })
              return next
            })
          }
        }
      } catch {}
    }

    if (items.length) void loadCovers()
    return () => {
      cancelled = true
    }
  }, [items, coverMap])

  useEffect(() => {
    setCouponDiscount(0)
    setCouponError(null)
    setCouponSuccess(null)
  }, [items, subtotal])

  const runCouponValidation = async (code: string) => {
    if (!code) {
      setCouponError("กรุณากรอกโค้ดคูปอง")
      setCouponDiscount(0)
      setCouponSuccess(null)
      return
    }
    if (!items.length) {
      setCouponError("ไม่มีสินค้าในตะกร้า")
      setCouponDiscount(0)
      setCouponSuccess(null)
      return
    }
    try {
      setValidatingCoupon(true)
      setCouponError(null)
      setCouponSuccess(null)
      const { discount } = await validateCartCoupon({
        code: code.trim(),
        userId: (user as any)?.id ?? "guest",
        subtotal,
        items: items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })
      setCouponDiscount(discount)
      setCouponSuccess(discount > 0 ? "ใช้คูปองสำเร็จ" : "ไม่มีส่วนลดสำหรับคูปองนี้")
    } catch (error: any) {
      setCouponDiscount(0)
      setCouponError(error?.message || "ใช้คูปองไม่สำเร็จ")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const updateCouponCode = (value: string) => {
    setCouponCode(value)
    setCouponError(null)
    setCouponSuccess(null)
  }

  const handleValidateCoupon = () => void runCouponValidation(couponCode.trim())

  useEffect(() => {
    if (!couponCode) return
    if (!items.length) return
    if (autoAppliedCoupon.current === couponCode) return
    autoAppliedCoupon.current = couponCode
    void runCouponValidation(couponCode.trim())
  }, [couponCode, items])

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "กรุณาเข้าสู่ระบบ", description: "เข้าสู่ระบบเพื่อทำการสั่งซื้อ" })
      router.replace("/cart")
      return
    }
    if (!itemCount) {
      toast({ variant: "destructive", title: "ไม่มีสินค้า", description: "เพิ่มสินค้าในตะกร้าเพื่อทำการสั่งซื้อ" })
      router.replace("/cart")
      return
    }

    setShippingError(null)
    const schoolCheck = validateSchool()
    if (!schoolCheck.ok) {
      setShippingError(schoolCheck.error)
      return
    }

    if (anyPhysical) {
      const validation = shippingAddressSchema.safeParse(shipping)
      if (!validation.success) {
        setShippingError(validation.error.issues[0]?.message ?? "ข้อมูลจัดส่งไม่ถูกต้อง")
        return
      }
    }

    try {
      setSubmitting(true)
      const { orderId } = await createOrder({
        userId: (user as any)?.id,
        items: items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        couponCode: couponCode ? couponCode.trim() : undefined,
        shippingAddress: anyPhysical ? shipping : undefined,
        school: schoolCheck.value,
      })
      if (schoolCheck.value) onSchoolSaved(schoolCheck.value)
      toast({ title: "สร้างคำสั่งซื้อสำเร็จ", description: "โปรดอัพโหลดสลิปชำระเงินหากมี" })
      void refresh()
      if (orderId) {
        router.push(`/order-success/${encodeURIComponent(orderId)}`)
      } else {
        router.push("/profile/orders")
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "ไม่สำเร็จ", description: error?.message || "ไม่สามารถสร้างคำสั่งซื้อได้" })
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!loading && !itemCount) {
      router.replace("/cart")
    }
  }, [loading, itemCount, router])

  return {
    router,
    items,
    itemCount,
    syncing,
    loadingState: loading || authLoading,
    coverMap,
    subtotal,
    totalAfterDiscount,
    couponDiscount,
    anyPhysical,
    couponCode,
    updateCouponCode,
    couponError,
    couponSuccess,
    validatingCoupon,
    handleValidateCoupon,
    school,
    schoolInput,
    setSchoolInput,
    shipping,
    setShipping,
    shippingError,
    submitting,
    handleSubmit,
  }
}
