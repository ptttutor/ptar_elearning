"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import http from "@/lib/http"

type QuestionReview = {
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

type TopicBreakdown = { topicId: string; topicName: string; correct: number; total: number; percent: number; isWeak: boolean }

type ResultView = {
  attempt: { id: string; mode: "PRACTICE" | "REAL"; totalMarks: number; obtainedMarks: number; percentage: number; passed: boolean }
  mockExam: { id: string; title: string }
  questions: QuestionReview[]
  topicBreakdown: TopicBreakdown[]
}

export default function MockExamResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [result, setResult] = useState<ResultView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !isAuthenticated || !attemptId) return
    let active = true
    const load = async () => {
      try {
        const res = await http.get(`/api/mock-attempts/${attemptId}/result`)
        if (!res.data?.success) throw new Error(res.data?.error || "โหลดผลข้อสอบไม่สำเร็จ")
        if (active) setResult(res.data.data)
      } catch (e: any) {
        if (active) setError(e?.response?.data?.error || e?.message || "โหลดผลข้อสอบไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [authLoading, isAuthenticated, attemptId])

  if (!authLoading && !isAuthenticated) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">โปรดเข้าสู่ระบบ</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/mock-exams">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปรายการข้อสอบจำลอง
        </Button>
      </Link>

      {(loading || authLoading) && (
        <>
          <Skeleton className="h-32" />
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </>
      )}
      {error && <div className="text-destructive">{error}</div>}

      {!loading && !error && result && (
        <>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-1">{result.mockExam.title}</p>
              <div className="text-4xl font-bold text-foreground">
                {result.attempt.obtainedMarks}/{result.attempt.totalMarks}
              </div>
              <p className="text-muted-foreground mt-1">{result.attempt.percentage.toFixed(1)}%</p>
              <Badge
                className={`mt-3 ${result.attempt.passed ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}
              >
                {result.attempt.passed ? "ผ่าน" : "ไม่ผ่าน"}
              </Badge>
            </CardContent>
          </Card>

          {result.topicBreakdown.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-1">วิเคราะห์จุดที่ควรพัฒนา</h3>
                <p className="text-sm text-muted-foreground mb-4">สรุปคะแนนแยกตามเรื่องที่ข้อสอบวัด เรียงจากเรื่องที่ทำได้น้อยที่สุดก่อน</p>
                <div className="space-y-3">
                  {result.topicBreakdown.map((t) => (
                    <div key={t.topicId}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className={t.isWeak ? "font-semibold text-destructive" : "text-foreground"}>{t.topicName}</span>
                        <span className="text-muted-foreground">
                          {t.correct}/{t.total} ({t.percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${t.isWeak ? "bg-destructive" : "bg-emerald-500"}`} style={{ width: `${t.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {result.topicBreakdown.some((t) => t.isWeak) && (
                  <div className="mt-4 pt-4 border-t space-y-1 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">คำแนะนำ</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.topicBreakdown
                        .filter((t) => t.isWeak)
                        .map((t) => (
                          <li key={t.topicId}>
                            ควรทบทวนเรื่อง <span className="font-semibold text-foreground">{t.topicName}</span> เพิ่มเติม (ทำถูก {t.correct} จาก {t.total} ข้อ)
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {result.questions.map((q, idx) => {
              const sa = q.studentAnswer
              const cardTone =
                sa?.isCorrect === true
                  ? "border-emerald-200 bg-emerald-50/40"
                  : sa?.isCorrect === false
                  ? "border-rose-200 bg-rose-50/40"
                  : "border-border"
              return (
                <Card key={q.id} className={cardTone}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground">
                        {idx + 1}. {q.questionText}
                      </p>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {sa?.marksAwarded ?? 0}/{q.marks} คะแนน
                      </span>
                    </div>

                    {q.questionImage && (
                      <img src={q.questionImage} alt="" className="max-w-full rounded-md border" />
                    )}

                    {q.questionType === "SHORT_ANSWER" ? (
                      <div className="text-sm space-y-1">
                        <p>
                          คำตอบของคุณ: <span className="font-medium">{sa?.textAnswer || "(ไม่ได้ตอบ)"}</span>
                        </p>
                        <p className="text-muted-foreground">เฉลย: {q.options.find((o) => o.isCorrect)?.optionText}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
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

                    {q.explanation && <p className="text-sm text-muted-foreground">คำอธิบาย: {q.explanation}</p>}
                    {q.explanationImages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {q.explanationImages.map((url, i) => (
                          <img key={url + i} src={url} alt="" className="h-24 w-32 rounded-md border object-cover" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
