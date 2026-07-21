import type { Order, OrderListItem } from "@/features/profile-orders/types"

export type DisplayOrderItem = OrderListItem & { _key: string }

/** Real order.items if present, else a single synthetic item from the legacy course/ebook fields. */
export function getDisplayItems(order: Order): DisplayOrderItem[] {
  const rawItems = Array.isArray(order.items) ? order.items.filter(Boolean) : []
  const fallbackItems: OrderListItem[] = []
  if (!rawItems.length) {
    if (order.course || order.courseId) {
      fallbackItems.push({
        itemType: "COURSE",
        itemId: order.courseId,
        title: order.course?.title,
        quantity: 1,
        totalPrice: order.total,
        unitPrice: order.total,
      })
    }
    if (order.ebook || order.ebookId) {
      fallbackItems.push({
        itemType: "EBOOK",
        itemId: order.ebookId,
        title: order.ebook?.title,
        quantity: 1,
        totalPrice: order.total,
        unitPrice: order.total,
      })
    }
  }
  const items = rawItems.length ? rawItems : fallbackItems
  return items.map((item, idx) => ({
    ...item,
    _key: item.id || `${item.itemType || order.orderType}-${item.itemId || idx}`,
  }))
}

export function getOrderStatusFlags(order: Order) {
  const orderState = (order.status || "").toUpperCase()
  const payState = (order.payment?.status || "").toUpperCase()
  const isCancelled = ["CANCELLED", "REJECTED"].includes(orderState)
  const effectiveState = payState || orderState
  const needsSlipUpload = !isCancelled && ["PENDING", "PENDING_VERIFICATION"].includes(effectiveState)
  const isPaid = !isCancelled && effectiveState === "COMPLETED"
  return { isCancelled, needsSlipUpload, isPaid }
}
