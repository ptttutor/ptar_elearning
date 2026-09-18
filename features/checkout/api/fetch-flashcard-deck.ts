import http from "@/lib/http"
import type { CheckoutFlashcardDeck } from "@/features/checkout/types"

// Deck info + whether the current user already owns it (the endpoint is
// authenticated, unlike the public course/ebook lookups).
export async function fetchFlashcardDeckForCheckout(id: string): Promise<CheckoutFlashcardDeck> {
  const res = await http.get(`/api/flashcards/decks/${encodeURIComponent(id)}`)
  if (!res.data?.success) throw new Error(res.data?.error || "โหลดข้อมูลไม่สำเร็จ")
  return res.data.data
}
