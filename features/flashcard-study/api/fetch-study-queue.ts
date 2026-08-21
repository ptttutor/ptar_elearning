import http from "@/lib/http"
import type { StudyQueue } from "@/features/flashcard-study/types"

export async function fetchStudyQueue(deckId: string): Promise<StudyQueue> {
  const res = await http.get(`/api/flashcards/study/${deckId}`)
  if (!res.data?.success) throw new Error(res.data?.error || "โหลดข้อมูลไม่สำเร็จ")
  return res.data.data
}
