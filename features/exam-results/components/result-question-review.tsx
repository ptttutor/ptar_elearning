import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { ResultQuestion } from "@/features/exam-results/types"

export function ResultQuestionReview({ question, index }: { question: ResultQuestion; index: number }) {
  const options = question.options || []
  const userOption = options.find((o) => o.id === question.userOptionId)
  const correctOption = options.find((o) => o.id === question.correctOptionId || o.isCorrect)
  const userAnswerText = question.userTextAnswer || userOption?.text || question.userOptionId || "-"
  const correctAnswerText = question.correctTextAnswer || correctOption?.text || question.correctOptionId || "-"
  const isCorrect = question.isCorrect ?? (question.correctOptionId && question.correctOptionId === question.userOptionId)
  const obtainedMarks = question.obtainedMarks ?? (isCorrect ? question.marks ?? 0 : 0)

  return (
    <div className="p-4 border rounded-lg bg-white space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="font-medium text-gray-900">
          {index + 1}. {question.text || "คำถาม"}
        </div>
        <Badge className={isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}>
          {isCorrect ? "ถูกต้อง" : "ไม่ถูก"}
        </Badge>
      </div>
      {question.image && (
        <div className="overflow-hidden rounded-md border">
          <Image src={question.image} alt={question.text || `Question ${index + 1}`} width={800} height={450} className="h-auto w-full object-contain bg-white" />
        </div>
      )}
      <div className="text-xs text-gray-500">
        คะแนนที่ได้: {obtainedMarks}/{question.marks ?? "-"}
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <div>
          คำตอบของคุณ: <span className="font-medium">{userAnswerText}</span>
        </div>
        <div>
          เฉลย: <span className="font-medium">{correctAnswerText}</span>
        </div>
        {question.explanation && <div className="text-xs text-gray-500">อธิบาย: {question.explanation}</div>}
      </div>
      {options.length > 0 && (
        <div className="pt-2 text-xs text-gray-500 space-y-1">
          <div className="font-semibold text-gray-600">ตัวเลือกทั้งหมด:</div>
          <ul className="space-y-1">
            {options.map((opt) => (
              <li key={opt.id} className={`${opt.id === question.userOptionId ? "text-gray-900" : "text-gray-600"}`}>
                <span className="font-medium">{opt.id === question.correctOptionId || opt.isCorrect ? "✓" : "•"}</span> {opt.text || opt.id}
                {opt.id === question.userOptionId && " (เลือก)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
