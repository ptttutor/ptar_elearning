import { useEffect, useState } from "react"
import { fetchItemCover } from "@/features/profile-orders/api/fetch-item-covers"
import { getDisplayItems } from "@/features/profile-orders/selectors"
import type { Order } from "@/features/profile-orders/types"

/** key = "COURSE:<id>" / "EBOOK:<id>" -> cover image url (or "" if none found). */
export function useOrderItemCovers(orders: Order[]) {
  const [itemAssets, setItemAssets] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!orders.length) return
    let cancelled = false

    const loadAssets = async () => {
      const toFetch: Array<{ key: string; type: string; id: string }> = []

      for (const order of orders) {
        for (const item of getDisplayItems(order)) {
          const type = String(item.itemType || order.orderType || "").toUpperCase()
          const itemId = item.itemId || (type === "COURSE" ? order.courseId : order.ebookId) || ""
          if (!itemId) continue
          const key = `${type}:${itemId}`
          if (itemAssets[key] === undefined) toFetch.push({ key, type, id: itemId })
        }
      }

      if (!toFetch.length) return

      const results = await Promise.all(toFetch.map(async ({ key, type, id }) => [key, await fetchItemCover(type, id)] as const))

      if (!cancelled && results.length) {
        setItemAssets((prev) => {
          const next = { ...prev }
          for (const [key, cover] of results) {
            if (next[key] === undefined) next[key] = cover || ""
          }
          return next
        })
      }
    }

    loadAssets()
    return () => {
      cancelled = true
    }
  }, [orders, itemAssets])

  return itemAssets
}
