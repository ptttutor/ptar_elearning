import { isPaidLikeStatus } from "@/lib/order-status"
import type { Order, PaidEbookEntry } from "@/features/profile-my-books/types"

export const linkKey = (orderId: string, ebookId: string) => `${orderId}:${ebookId}`

/** Flattens paid ebook entries from orders — supports legacy single-ebook orders and multi-item orders, de-duplicated. */
export function getPaidEbookEntries(orders: Order[]): PaidEbookEntry[] {
  const entries: PaidEbookEntry[] = []

  for (const order of orders) {
    if (!isPaidLikeStatus(order.status) && !isPaidLikeStatus(order.payment?.status)) continue

    const eb = order.ebook
    if (eb?.id) {
      entries.push({ orderId: order.id, ebookId: String(eb.id), title: eb.title, coverImageUrl: eb.coverImageUrl, author: eb.author })
    }

    const items = Array.isArray(order.items) ? order.items : []
    for (const item of items) {
      if (String(item?.itemType || "").toUpperCase() !== "EBOOK") continue
      const ebookId = String(item?.itemId || "")
      if (!ebookId) continue
      entries.push({
        orderId: order.id,
        ebookId,
        title: item?.title || eb?.title,
        coverImageUrl: item?.coverImageUrl || eb?.coverImageUrl,
        author: item?.author || eb?.author,
      })
    }
  }

  const seen = new Set<string>()
  return entries.filter((entry) => {
    const key = linkKey(entry.orderId, entry.ebookId)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
