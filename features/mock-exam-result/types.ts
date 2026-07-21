export type QuestionReview = {
  id: string
  order: number
  questionText: string
  questionImage: string | null
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  marks: number
  topic: { id: string; name: string } | null
  explanation: string | null
  explanationImages: string[]
  options: { id: string; optionText: string; isCorrect: boolean }[]
  studentAnswer: { optionId: string | null; textAnswer: string | null; isCorrect: boolean | null; marksAwarded: number } | null
}

export type TopicBreakdown = { topicId: string; topicName: string; correct: number; total: number; percent: number; isWeak: boolean }

export type ResultView = {
  attempt: { id: string; mode: "PRACTICE" | "REAL"; totalMarks: number; obtainedMarks: number; percentage: number; passed: boolean }
  mockExam: { id: string; title: string }
  questions: QuestionReview[]
  topicBreakdown: TopicBreakdown[]
}
