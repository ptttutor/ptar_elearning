import http from "@/lib/http"
import type { ApiFlashcardDeck } from "@/features/flashcards-list/types"

export type FetchFlashcardDecksParams = { subject: string; gradeLevel: string }

// Authenticated (dueCount/newCount are per-user) — always fetched client-side
// via `http`, which attaches the bearer token from localStorage. Unlike
// features/mock-exams-list, there's no server-side initial fetch here since
// the decks endpoint requires a signed-in user.
export async function fetchFlashcardDecks(params: FetchFlashcardDecksParams): Promise<ApiFlashcardDeck[]> {
  const query: Record<string, string> = {}
  if (params.subject !== "all") query.subject = params.subject
  if (params.gradeLevel !== "all") query.gradeLevel = params.gradeLevel

  const res = await http.get("/api/flashcards/decks", { params: query })
  if (!res.data?.success) throw new Error(res.data?.error || "โหลดข้อมูลไม่สำเร็จ")
  return res.data.data ?? []
}
