import { authHeaders } from "@/lib/auth-headers"
import type { Order, OrderResponse } from "@/features/order-success/types"

export async function fetchOrder(orderId: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    cache: "no-store",
    headers: authHeaders(),
  })
  const text = await res.text().catch(() => "")
  let json: OrderResponse | null = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {}
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }
  return json.data!
}
