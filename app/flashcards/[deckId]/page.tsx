import { FlashcardStudyClient } from "@/features/flashcard-study/flashcard-study-client"
import { pageTitle } from "@/lib/site-config"

type PageProps = { params: Promise<{ deckId: string }> }

export const metadata = {
  title: pageTitle("ท่องแฟลชการ์ด"),
}

export default async function FlashcardStudyPage({ params }: PageProps) {
  const { deckId } = await params
  return <FlashcardStudyClient deckId={deckId} />
}
