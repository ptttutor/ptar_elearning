/**
 * Two coupon-validation shapes, both hitting the same /api/coupons/validate
 * route: one for multi-item carts (list of items), one for a single-item
 * checkout (course/ebook/mock exam bought directly, skipping the cart).
 */

type CartCouponPayload = {
  code: string
  userId: string
  subtotal: number
  items: Array<{ itemType: string; itemId: string; quantity: number; unitPrice: number }>
}

export async function validateCartCoupon(payload: CartCouponPayload): Promise<{ discount: number }> {
  const res = await fetch(`/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "ใช้คูปองไม่สำเร็จ")
  }
  return { discount: Number(json?.data?.discount || 0) }
}

type ItemCouponPayload = {
  code: string
  userId: string
  itemType: "course" | "ebook" | "mock_exam"
  itemId: string
  subtotal: number
}

export async function validateItemCoupon(payload: ItemCouponPayload): Promise<{ discount: number }> {
  const res = await fetch(`/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "ใช้คูปองไม่สำเร็จ")
  }
  return { discount: Number(json?.data?.discount || 0) }
}
