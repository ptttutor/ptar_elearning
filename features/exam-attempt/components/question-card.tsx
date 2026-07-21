import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { AnswerValue, Question } from "@/features/exam-attempt/types"

type QuestionCardProps = {
  question: Question
  index: number
  answer: AnswerValue | undefined
  onChoice: (optionId: string) => void
  onText: (text: string) => void
}

export function QuestionCard({ question, index, answer, onChoice, onText }: QuestionCardProps) {
  const qType = (question.type || (Array.isArray(question.options) && question.options.length === 2 ? "TRUE_FALSE" : "MULTIPLE_CHOICE")).toUpperCase()
  const options = question.options || [
    { id: "TRUE", text: "ถูก" },
    { id: "FALSE", text: "ผิด" },
  ]

  return (
    <div className="rounded-xl bg-background p-4 shadow-sm space-y-4 transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          {question.image && (
            <div className="aspect-[16/9] max-w-[830px] relative w-full overflow-hidden rounded-md border bg-muted">
              <Image
                src={question.image}
                alt={question.text || `Question ${index + 1}`}
                width={960}
                height={540}
                className="h-auto w-full object-contain bg-background"
                unoptimized
              />
            </div>
          )}
          <p className="font-medium text-foreground">
            {index + 1}. {question.text || "คำถาม"}
          </p>
        </div>
      </div>

      {typeof question.marks === "number" && <Badge className="bg-primary/10 text-primary px-2 py-1 text-[11px] font-medium">{question.marks} คะแนน</Badge>}

      {qType === "SHORT_ANSWER" ? (
        <Input placeholder="พิมพ์คำตอบของคุณ" value={answer?.textAnswer || ""} onChange={(e) => onText(e.target.value)} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-1">
          {options.map((opt) => {
            const selected = answer?.optionId === opt.id
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-primary ${
                  selected ? "border-primary bg-primary/10 ring-1 ring-primary/20" : "border-border bg-card hover:bg-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  className="h-4 w-4 text-primary border-border focus:ring-primary"
                  checked={selected}
                  onChange={() => onChoice(opt.id)}
                />
                <span className="text-sm text-foreground">{opt.text || opt.id}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
