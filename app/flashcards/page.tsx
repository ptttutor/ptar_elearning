import { FlashcardsListClient } from "@/features/flashcards-list/flashcards-list-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("แฟลชการ์ด"),
  description: "ทบทวนเนื้อหาด้วยระบบแฟลชการ์ดแบบ spaced repetition ตามรอบที่เหมาะกับคุณ",
}

export default function FlashcardsPage() {
  return <FlashcardsListClient />
}
