import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import type { ShippingAddress } from "@/features/cart/types"
import { fetchCourseCover, fetchEbookCover } from "@/features/cart/api/fetch-item-cover"
import { validateCoupon } from "@/features/cart/api/validate-coupon"
import { createOrder } from "@/features/cart/api/create-order"
import { shippingAddressSchema } from "@/features/cart/schemas/shipping-address.schema"

const EMPTY_SHIPPING: ShippingAddress = {
  name: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
}

export function useCartCheckout() {
  const router = useRouter()
  const { toast } = useToast()
  const { items, loading, syncing, itemCount, increase, decrease, remove, refresh, subtotal: cartSubtotal } = useCart()
  const { isAuthenticated, user } = useAuth()

  const [couponCode, setCouponCode] = useState("")
  const [shipping, setShipping] = useState<ShippingAddress>(EMPTY_SHIPPING)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [coverMap, setCoverMap] = useState<Record<string, string>>({})
  const [physicalMap, setPhysicalMap] = useState<Record<string, boolean>>({})
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) void refresh()
  }, [isAuthenticated, refresh])

  const subtotal = useMemo(() => {
    if (cartSubtotal && !Number.isNaN(cartSubtotal)) return cartSubtotal
    return items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0)
  }, [cartSubtotal, items])
  const totalAfterDiscount = useMemo(() => Math.max(0, subtotal - couponDiscount), [subtotal, couponDiscount])
  const anyPhysical = useMemo(() => {
    return items.some((item) => {
      const type = String(item?.itemType || item?.type || "").toUpperCase()
      if (type.includes("PHYSICAL")) return true
      if (item?.isPhysical) return true
      if (item?.course?.isPhysical) return true
      const courseType = String(item?.course?.type || "").toUpperCase()
      if (courseType.includes("PHYSICAL")) return true
      const productType = String(item?.productType || "").toUpperCase()
      if (productType.includes("PHYSICAL")) return true
      if (type === "COURSE") {
        const key = `COURSE:${item?.itemId}`
        if (physicalMap[key]) return true
      }
      return false
    })
  }, [items, physicalMap])

  useEffect(() => {
    let cancelled = false
    const loadCovers = async () => {
      const courseIds = new Set<string>()
      const ebookIds = new Set<string>()

      items.forEach((item) => {
        const type = String(item.itemType).toUpperCase()
        const key = `${type}:${item.itemId}`
        if (type === "COURSE") {
          if (item.itemId && (physicalMap[key] === undefined || (!item.coverImageUrl && !coverMap[key]))) {
            courseIds.add(item.itemId)
          }
        } else if (type === "EBOOK") {
          if (item.itemId && !item.coverImageUrl && !coverMap[key]) {
            ebookIds.add(item.itemId)
          }
        }
      })

      try {
        if (courseIds.size) {
          const results = await Promise.all(Array.from(courseIds).map(fetchCourseCover))
          if (!cancelled) {
            setCoverMap((prev) => {
              const next = { ...prev }
              results.forEach(({ id, cover }) => {
                if (cover) next[`COURSE:${id}`] = cover
              })
              return next
            })
            setPhysicalMap((prev) => {
              const next = { ...prev }
              results.forEach(({ id, isPhysical }) => {
                if (isPhysical) next[`COURSE:${id}`] = true
              })
              return next
            })
          }
        }

        if (ebookIds.size) {
          const results = await Promise.all(Array.from(ebookIds).map(fetchEbookCover))
          if (!cancelled) {
            setCoverMap((prev) => {
              const next = { ...prev }
              results.forEach(({ id, cover }) => {
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
  }, [items, coverMap, physicalMap])

  useEffect(() => {
    setCouponDiscount(0)
    setCouponError(null)
    setCouponSuccess(null)
  }, [items, subtotal])

  const updateCouponCode = (value: string) => {
    setCouponCode(value)
    setCouponError(null)
    setCouponSuccess(null)
  }

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("กรุณากรอกรหัสคูปอง")
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
      const { discount } = await validateCoupon({
        code: couponCode.trim(),
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

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "กรุณาเข้าสู่ระบบ", description: "เข้าสู่ระบบเพื่อทำการสั่งซื้อ" })
      return
    }
    if (!itemCount) {
      toast({ variant: "destructive", title: "ไม่มีสินค้าในตะกร้า", description: "เลือกสินค้าที่ต้องการก่อนทำการสั่งซื้อ" })
      return
    }
    if (anyPhysical) {
      const validation = shippingAddressSchema.safeParse(shipping)
      if (!validation.success) {
        setShippingError(validation.error.issues[0]?.message ?? "ข้อมูลจัดส่งไม่ถูกต้อง")
        return
      }
      setShippingError(null)
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
        couponCode: couponCode || undefined,
        shippingAddress: anyPhysical ? shipping : undefined,
      })
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

  return {
    router,
    items,
    loading,
    syncing,
    itemCount,
    increase,
    decrease,
    remove,
    isAuthenticated,
    coverMap,
    subtotal,
    totalAfterDiscount,
    anyPhysical,
    couponCode,
    updateCouponCode,
    couponError,
    couponSuccess,
    validatingCoupon,
    handleValidateCoupon,
    shipping,
    setShipping,
    shippingError,
    couponDiscount,
    submitting,
    handleCheckout,
  }
}
