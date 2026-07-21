import { CheckCircle2, XCircle, ZoomIn } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { QuestionReview } from "@/features/mock-exam-result/types"

export function QuestionReviewCard({ question, index, onPreviewImage }: { question: QuestionReview; index: number; onPreviewImage: (url: string) => void }) {
  const sa = question.studentAnswer
  const cardTone = sa?.isCorrect === true ? "border-emerald-200 bg-emerald-50/40" : sa?.isCorrect === false ? "border-rose-200 bg-rose-50/40" : "border-border"

  return (
    <Card className={cardTone}>
      <CardContent className="p-5 space-y-3">
        {(question.explanation || question.explanationImages.length > 0) && (
          <div className="rounded-md border border-dashed bg-background/60 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">เฉลย</p>
            {question.explanation && <p className="text-sm text-foreground">{question.explanation}</p>}
            {question.explanationImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.explanationImages.map((url, i) => (
                  <button key={url + i} type="button" onClick={() => onPreviewImage(url)} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external/admin-uploaded URLs, not worth Next/Image config here */}
                    <img src={url} alt="" className="h-24 w-32 rounded-md border object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-foreground">
            {index + 1}. {question.questionText}
          </p>
          <span className="shrink-0 text-sm text-muted-foreground">
            {sa?.marksAwarded ?? 0}/{question.marks} คะแนน
          </span>
        </div>

        {question.questionImage && (
          <button type="button" onClick={() => onPreviewImage(question.questionImage!)} className="group relative block">
            {/* eslint-disable-next-line @next/next/no-img-element -- external/admin-uploaded URLs, not worth Next/Image config here */}
            <img src={question.questionImage} alt="" className="max-w-full rounded-md border" />
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
              <ZoomIn className="h-6 w-6 text-white" />
            </span>
          </button>
        )}

        {question.questionType === "SHORT_ANSWER" ? (
          <div className="text-sm space-y-1">
            <p>
              คำตอบของคุณ: <span className="font-medium">{sa?.textAnswer || "(ไม่ได้ตอบ)"}</span>
            </p>
            <p className="text-muted-foreground">เฉลย: {question.options.find((o) => o.isCorrect)?.optionText}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {question.options.map((opt) => {
              const picked = sa?.optionId === opt.id
              return (
                <div key={opt.id} className="flex items-center gap-2 text-sm">
                  {opt.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : picked ? (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  <span className={picked ? "font-medium" : ""}>{opt.optionText}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
