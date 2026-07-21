import { useEffect, useState } from "react"
import { fetchOrdersForUser } from "@/features/profile-orders/api/fetch-orders"
import type { Order } from "@/features/profile-orders/types"

export function useOrders(userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchOrdersForUser(userId)
        if (active) setOrders(data)
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดคำสั่งซื้อไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [userId])

  const refetch = async () => {
    if (!userId) return
    try {
      const data = await fetchOrdersForUser(userId)
      setOrders(data)
    } catch {}
  }

  return { orders, loading, error, refetch }
}
