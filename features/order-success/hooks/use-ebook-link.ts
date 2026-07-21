import { useEffect, useState } from "react"
import { fetchEbookPreviewUrl } from "@/features/order-success/api/fetch-ebook-preview"
import { isPaidLikeStatus } from "@/features/order-success/selectors"
import type { Order, OrderItem } from "@/features/order-success/types"

export function useEbookLink(order: Order | null, ebookFileUrl: string | null, primaryEbookItem: OrderItem | undefined) {
  const [ebookLink, setEbookLink] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const completed = isPaidLikeStatus(order?.status) || isPaidLikeStatus(order?.payment?.status)
        if (!order || !completed) return
        const ebookId = order.ebook?.id || primaryEbookItem?.itemId
        if (!ebookId) return
        if (ebookFileUrl) {
          setEbookLink(ebookFileUrl)
          return
        }
        const link = await fetchEbookPreviewUrl(String(ebookId))
        if (!cancelled) setEbookLink(link)
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [order, ebookFileUrl, primaryEbookItem?.itemId])

  return ebookLink
}
