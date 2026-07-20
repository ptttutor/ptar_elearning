"use client"

import Image from "next/image"
import { Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export type MockQuestionView = {
  id: string
  order: number
  marks: number
  locked: boolean
  questionText?: string
  questionImage?: string | null
  questionType?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  topic?: { id: string; name: string } | null
  explanation?: string | null
  explanationImages?: string[]
  options?: { id: string; optionText: string; isCorrect?: boolean }[]
  selectedOptionId?: string | null
  textAnswer?: string | null
  isCorrect?: boolean | null
  marksAwarded?: number | null
}

type AnswerValue = { optionId?: string; textAnswer?: string }

export default function MockQuestionField({
  index,
  question,
  mode,
  value,
  practiceTokens,
  unlocking,
  onSave,
  onUnlock,
}: {
  index: number
  question: MockQuestionView
  mode: "PRACTICE" | "REAL"
  value: AnswerValue
  practiceTokens: number | null
  unlocking: boolean
  onSave: (payload: AnswerValue) => void
  onUnlock: (questionId: string) => void
}) {
  if (question.locked) {
    return (
      <div className="rounded-xl border border-dashed bg-background p-6 text-center space-y-3">
        <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="font-medium text-foreground">
          ข้อที่ {index + 1} <span className="text-sm text-muted-foreground">({question.marks} คะแนน)</span>
        </p>
        <Button
          variant="outline"
          disabled={unlocking || practiceTokens === 0}
          onClick={() => onUnlock(question.id)}
        >
          {unlocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
          ปลดล็อคข้อนี้
        </Button>
        {practiceTokens === 0 && <p className="text-xs text-destructive">token หมดแล้ว</p>}
      </div>
    )
  }

  const showFeedback = mode === "PRACTICE" && question.isCorrect != null

  return (
    <div className="rounded-xl bg-background p-4 shadow-sm space-y-4">
      <div className="space-y-2">
        {question.questionImage && (
          <div className="aspect-[16/9] max-w-[830px] relative w-full overflow-hidden rounded-md border bg-muted">
            <Image
              src={question.questionImage}
              alt={question.questionText || `Question ${index + 1}`}
              width={960}
              height={540}
              className="h-auto w-full object-contain bg-background"
              unoptimized
            />
          </div>
        )}
        <p className="font-medium text-foreground">
          {index + 1}. {question.questionText}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge className="bg-primary/10 text-primary px-2 py-1 text-[11px] font-medium">{question.marks} คะแนน</Badge>
        {question.topic && (
          <Badge variant="outline" className="text-[11px]">
            {question.topic.name}
          </Badge>
        )}
      </div>

      {question.questionType === "SHORT_ANSWER" ? (
        <Input
          placeholder="พิมพ์คำตอบของคุณ"
          value={value.textAnswer || ""}
          onChange={(e) => onSave({ textAnswer: e.target.value })}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-1">
          {(question.options || []).map((opt) => {
            const selected = value.optionId === opt.id
            const rowStyle = showFeedback
              ? opt.isCorrect
                ? "border-emerald-400 bg-emerald-50"
                : selected
                ? "border-destructive bg-destructive/10"
                : "border-border bg-card"
              : selected
              ? "border-primary bg-primary/10 ring-1 ring-primary/20"
              : "border-border bg-card hover:bg-accent/50"
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-primary ${rowStyle}`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  className="h-4 w-4 text-primary border-border focus:ring-primary"
                  checked={selected}
                  onChange={() => onSave({ optionId: opt.id })}
                />
                <span className="text-sm text-foreground">{opt.optionText}</span>
              </label>
            )
          })}
        </div>
      )}

      {showFeedback && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            question.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <p className="font-semibold">
            {question.isCorrect ? `ถูกต้อง! (${question.marksAwarded}/${question.marks} คะแนน)` : "ยังไม่ถูกต้อง"}
          </p>
          {question.explanation && <p className="mt-1 text-muted-foreground">คำอธิบาย: {question.explanation}</p>}
          {question.explanationImages && question.explanationImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {question.explanationImages.map((url, i) => (
                <img key={url + i} src={url} alt="" className="h-24 w-32 rounded-md border object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
