import type { CheckoutEbook } from "@/features/checkout/types"

export async function fetchEbookById(id: string): Promise<CheckoutEbook> {
  const res = await fetch(`/api/ebooks`, { cache: "no-store" })
  const json = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  const found = (json.data || []).find((book: CheckoutEbook) => String(book.id) === String(id))
  if (!found) throw new Error("ไม่พบหนังสือ")
  return found
}
