export type FlashcardAnswerMode = "SELF_GRADE" | "MULTIPLE_CHOICE" | "TYPED"

export type StudyCardOption = {
  id: string
  optionText: string
  isCorrect: boolean
  order: number
}

export type StudyCard = {
  id: string
  front: string
  frontImage: string | null
  back: string
  backImage: string | null
  hint: string | null
  answerMode: FlashcardAnswerMode
  acceptedAnswers: string[]
  numericTolerance: number | null
  options: StudyCardOption[]
}

export type StudyDeck = {
  id: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string | null
  topic: { id: string; name: string } | null
}

export type StudyQueue = {
  deck: StudyDeck
  cards: StudyCard[]
  dueCount: number
  newCount: number
  total: number
}

export type ReviewResult = {
  id: string
  repetitions: number
  easeFactor: number
  interval: number
  nextReviewAt: string
  lastReviewedAt: string
  lapses: number
  status: string
}
