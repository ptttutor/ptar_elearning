export type ApiFlashcardDeck = {
  id: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string | null
  coverImageUrl: string | null
  topic: { id: string; name: string } | null
  totalCards: number
  dueCount: number
  newCount: number
}

export type ApiDecksResponse = {
  success: boolean
  data?: ApiFlashcardDeck[]
  error?: string
}
