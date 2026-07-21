import type { ShippingAddress } from "@/features/cart/types"

type CreateOrderPayload = {
  userId: string
  items: Array<{ itemType: string; itemId: string; title: string; quantity: number; unitPrice: number }>
  couponCode?: string
  shippingAddress?: ShippingAddress
}

export async function createOrder(payload: CreateOrderPayload): Promise<{ orderId: string }> {
  const res = await fetch(`/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "ไม่สามารถสร้างคำสั่งซื้อได้")
  }
  return { orderId: String(json?.data?.orderId ?? json?.data?.id ?? "") }
}
