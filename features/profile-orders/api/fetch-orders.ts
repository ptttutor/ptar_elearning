import http from "@/lib/http"
import type { Order, OrdersResponse } from "@/features/profile-orders/types"

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  const res = await http.get(`/api/orders`, { params: { userId } })
  const json: OrdersResponse = res.data || { success: false, data: [] }
  if (res.status < 200 || res.status >= 300 || json.success === false) {
    throw new Error((json as any)?.error || "โหลดคำสั่งซื้อไม่สำเร็จ")
  }
  return Array.isArray(json.data) ? json.data : []
}
