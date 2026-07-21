import { useEffect, useState } from "react"
import { fetchOrder } from "@/features/order-success/api/fetch-order"
import type { Order } from "@/features/order-success/types"

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (!id) return
        const data = await fetchOrder(String(id))
        if (active) setOrder(data)
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const refreshOrder = async () => {
    if (!order?.id) return
    try {
      setLoading(true)
      const data = await fetchOrder(order.id)
      setOrder(data)
    } catch (e: any) {
      setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  return { order, loading, error, refreshOrder }
}
