import { useEffect, useState } from "react"
import { fetchOrdersForUser } from "@/features/profile-my-books/api/fetch-orders"
import type { Order } from "@/features/profile-my-books/types"

export function useOrders(userId: string | undefined, authLoading: boolean) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!userId) {
        if (!authLoading) setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchOrdersForUser(userId)
        if (active) setOrders(data)
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดรายการไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [userId, authLoading])

  return { orders, loading, error }
}
