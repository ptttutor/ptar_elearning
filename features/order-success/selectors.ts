import type { NormalizedShipping, Order, OrderItem, SummaryRow } from "@/features/order-success/types"
import { formatCurrency } from "@/lib/format"
import { isPaidLikeStatus } from "@/lib/order-status"

/**
 * Pure derivations from an Order — no state, no effects. Kept out of the
 * client component so the display logic (what counts as "paid", how the
 * price breakdown rows are built, ...) can be read/tested on its own.
 */

export { isPaidLikeStatus }

export function getSafeUserId(user: any): string | undefined {
  return (user?.id ?? user?.userId ?? user?._id ?? user?.uid) || undefined
}

export { formatCurrency }

export function toItemTypeLabel(itemType?: string) {
  const t = (itemType || "").toUpperCase()
  if (t === "COURSE") return "คอร์สเรียน"
  if (t === "EBOOK") return "หนังสือ / E-Book"
  return itemType || "สินค้า"
}

export function toPaymentMethodLabel(method?: string | null) {
  const m = (method || "").toUpperCase()
  if (m === "BANK_TRANSFER") return "โอนผ่านธนาคาร"
  if (m === "CREDIT_CARD") return "บัตรเครดิต"
  if (m === "PROMPTPAY") return "พร้อมเพย์"
  if (!method) return "-"
  return method
}

export function getPaymentStatus(order: Order | null) {
  return (order?.payment?.status || order?.status || "").toUpperCase()
}

export function getDisplayItems(order: Order | null): OrderItem[] {
  if (!order) return []
  const rawItems = Array.isArray(order.items) ? order.items.filter(Boolean) : []
  if (rawItems.length > 0) return rawItems as OrderItem[]

  const fallback: OrderItem[] = []
  if (order.course?.id) {
    fallback.push({
      id: `course-${order.course.id}`,
      itemType: "COURSE",
      itemId: order.course.id,
      title: order.course.title,
      quantity: 1,
      unitPrice: order.total ?? order.subtotal,
      totalPrice: order.total ?? order.subtotal,
    })
  }
  if (order.ebook?.id) {
    fallback.push({
      id: `ebook-${order.ebook.id}`,
      itemType: "EBOOK",
      itemId: order.ebook.id,
      title: order.ebook.title,
      quantity: 1,
      unitPrice: order.total ?? order.subtotal,
      totalPrice: order.total ?? order.subtotal,
    })
  }
  return fallback
}

export function getNormalizedShipping(order: Order | null): NormalizedShipping | null {
  const s1: any = order?.shippingAddress
  if (s1 && (s1.name || s1.address || s1.district || s1.province || s1.postalCode)) {
    return {
      name: s1.name || "",
      phone: s1.phone || "",
      address: s1.address || "",
      district: s1.district || "",
      province: s1.province || "",
      postalCode: s1.postalCode || "",
    }
  }
  const s2: any = order?.shipping
  if (s2 && (s2.recipientName || s2.address || s2.district || s2.province || s2.postalCode)) {
    return {
      name: s2.recipientName || "",
      phone: s2.recipientPhone || "",
      address: s2.address || "",
      district: s2.district || "",
      province: s2.province || "",
      postalCode: s2.postalCode || "",
    }
  }
  return null
}

export function getItemTypeSummary(order: Order | null, displayItems: OrderItem[]) {
  if (displayItems.length === 0) {
    return order?.orderType ? toItemTypeLabel(order.orderType) : "-"
  }
  const labels = Array.from(new Set(displayItems.map((item) => toItemTypeLabel(item.itemType))))
  if (labels.length === 1) return labels[0]
  return `หลายประเภท (${labels.join(", ")})`
}

export function getSummaryRows(order: Order | null): SummaryRow[] {
  if (!order) return []
  const subtotal = Number(order.subtotal ?? 0)
  const discount = Number(order.discount ?? 0)
  const couponDiscount = Number(order.couponDiscount ?? 0)
  const shippingFee = Number(order.shippingFee ?? 0)
  const tax = Number(order.tax ?? 0)
  const total = Number(order.total ?? 0)

  const rows: SummaryRow[] = [{ label: "ยอดรวมสินค้า", value: formatCurrency(subtotal) }]

  if (discount !== 0) {
    const sign = discount < 0 ? "+" : "-"
    rows.push({ label: "ส่วนลดเพิ่มเติม", value: `${sign}${formatCurrency(Math.abs(discount))}` })
  }
  if (couponDiscount > 0) {
    rows.push({ label: "ส่วนลดคูปอง", value: `-${formatCurrency(couponDiscount)}` })
  }
  if (shippingFee > 0) {
    rows.push({ label: "ค่าจัดส่ง", value: formatCurrency(shippingFee) })
  }
  if (tax !== 0) {
    const sign = tax < 0 ? "-" : "+"
    rows.push({ label: "ภาษี", value: `${sign}${formatCurrency(Math.abs(tax))}` })
  }
  rows.push({ label: "ยอดชำระสุทธิ", value: formatCurrency(total), accent: true })
  return rows
}

export function getNeedsShipping(order: Order | null, normalizedShipping: NormalizedShipping | null, displayItems: OrderItem[]) {
  if (!order) return false
  if (normalizedShipping) return true
  if (order.shipping) return true
  if (typeof order.shippingFee === "number" && order.shippingFee > 0) return true
  return displayItems.some((item) => (item as any)?.isPhysical)
}

export function getSlipInfo(order: Order | null) {
  try {
    const notes = order?.payment?.notes ? JSON.parse(order.payment.notes) : null
    if (!notes || typeof notes !== "object") return null
    const slipOKSuccess = notes?.slipOKResult?.success ?? notes?.slipOKSuccess ?? null
    const detectedAmount = notes?.slipOKResult?.data?.amount ?? notes?.detectedAmount ?? null
    const detectedDate = notes?.slipOKResult?.data?.date ?? notes?.detectedDate ?? null
    const summary = notes?.validation?.summary ?? notes?.validationSummary ?? null
    return { slipOKSuccess, detectedAmount, detectedDate, summary }
  } catch {
    return null
  }
}
