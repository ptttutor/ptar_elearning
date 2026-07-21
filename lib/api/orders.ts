import type { ShippingAddress } from "@/lib/schemas/shipping-address.schema"

/**
 * Shared "create order" call — used by the cart page and every checkout
 * confirmation page (cart/course/ebook/mock-exam). The payload shape is the
 * same regardless of whether it's one item or several.
 */

type CreateOrderItem = {
  itemType: string
  itemId: string
  title: string
  quantity: number
  unitPrice: number
}

type CreateOrderPayload = {
  userId: string
  items: CreateOrderItem[]
  couponCode?: string
  shippingAddress?: ShippingAddress
  school?: string
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ orderId: string }> {
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "ไม่สามารถสร้างคำสั่งซื้อได้")
  }
  return { orderId: String(json?.data?.orderId ?? json?.data?.id ?? "") }
}

/**
 * Looks up whether the user already has a non-cancelled order for this
 * exact item, so checkout pages can redirect straight to the existing
 * order instead of letting the student pay twice. Course/ebook checkout
 * only — mock exams use the real entitlement check instead
 * (see features/checkout/api/check-mock-exam-access.ts).
 */
export async function findExistingOrder(
  userId: string,
  itemType: "COURSE" | "EBOOK",
  itemId: string
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
    const text = await res.text().catch(() => "")
    let json: any = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {}
    const list: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    const idField = itemType === "COURSE" ? "course" : "ebook"
    const idKey = itemType === "COURSE" ? "courseId" : "ebookId"
    const exists = list.find((order: any) => {
      const type = String(order?.orderType || order?.type || "").toUpperCase()
      const status = String(order?.status || "").toUpperCase()
      const orderItemId = order?.[idField]?.id || order?.[idKey] || (type === itemType ? order?.itemId || order?.itemID : undefined)
      const cancelled = ["CANCELLED", "REJECTED"].includes(status)
      return type === itemType && orderItemId && String(orderItemId) === String(itemId) && !cancelled
    })
    return exists?.id ? { id: String(exists.id) } : null
  } catch {
    return null
  }
}
