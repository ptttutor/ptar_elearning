type ValidateCouponPayload = {
  code: string
  userId: string
  subtotal: number
  items: Array<{ itemType: string; itemId: string; quantity: number; unitPrice: number }>
}

export async function validateCoupon(payload: ValidateCouponPayload): Promise<{ discount: number }> {
  const res = await fetch(`/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || "ใช้คูปองไม่สำเร็จ")
  }
  return { discount: Number(json?.data?.discount || 0) }
}
