"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Coins, Clock, Infinity as InfinityIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import http from "@/lib/http"
import MockQuestionField, { type MockQuestionView } from "@/components/mock-exam/MockQuestionField"

type AttemptView = {
  attempt: { id: string; mode: "PRACTICE" | "REAL"; status: string; startedAt: string; totalMarks: number }
  mockExam: { id: string; title: string; subject: string; timeLimit: number | null; practiceUnlockCost: number }
  questions: MockQuestionView[]
  remainingSeconds: number | null
  practiceTokens: number | null
  practiceUnlockCost: number
}

type AnswerValue = { optionId?: string; textAnswer?: string }

function isAnswered(v?: AnswerValue) {
  return !!v && (!!v.optionId || (!!v.textAnswer && v.textAnswer.trim().length > 0))
}

function formatCountdown(seconds: number | null) {
  if (seconds == null) return "-"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function MockExamAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [view, setView] = useState<AttemptView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [unlockingId, setUnlockingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const autoSubmitTriggered = useRef(false)

  const loadView = useCallback(async () => {
    if (!attemptId) return
    try {
      const res = await http.get(`/api/mock-attempts/${attemptId}`)
      if (!res.data?.success) throw new Error(res.data?.error || "โหลดข้อมูลไม่สำเร็จ")
      const data: AttemptView = res.data.data
      setView(data)
      setAnswers((prev) => {
        const seeded = { ...prev }
        for (const q of data.questions) {
          if (!seeded[q.id]) {
            seeded[q.id] = { optionId: q.selectedOptionId || undefined, textAnswer: q.textAnswer || undefined }
          }
        }
        return seeded
      })
      setError(null)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "โหลดข้อมูลการทำข้อสอบไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [attemptId])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    loadView()
  }, [authLoading, isAuthenticated, loadView])

  const mockExam = view?.mockExam
  const mode = view?.attempt.mode

  // REAL-mode countdown, computed from startedAt + timeLimit (same deadline
  // approach as the old exam system) so it survives clock drift/tab sleep.
  useEffect(() => {
    if (mode !== "REAL" || !mockExam?.timeLimit) {
      setRemainingSeconds(null)
      return
    }
    const deadline = new Date(view!.attempt.startedAt).getTime() + mockExam.timeLimit * 60_000
    const tick = () => {
      const diff = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setRemainingSeconds(diff)
      return diff
    }
    let current = tick()
    if (current === 0) return
    const timer = window.setInterval(() => {
      current = tick()
      if (current === 0) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [mode, mockExam?.timeLimit, view?.attempt.startedAt])

  const submit = useCallback(async () => {
    if (!attemptId || submitting) return
    try {
      setSubmitting(true)
      const res = await http.post(`/api/mock-attempts/${attemptId}/submit`)
      if (!res.data?.success) throw new Error(res.data?.error || "ส่งข้อสอบไม่สำเร็จ")
      router.replace(`/mock-exams/attempt/${attemptId}/result`)
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "ส่งข้อสอบไม่สำเร็จ" })
      setSubmitting(false)
    }
  }, [attemptId, router, submitting, toast])

  useEffect(() => {
    if (remainingSeconds !== 0 || autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true
    toast({ title: "หมดเวลาทำข้อสอบ", description: "ระบบได้ส่งคำตอบของคุณโดยอัตโนมัติ" })
    void submit()
  }, [remainingSeconds, submit, toast])

  const saveAnswer = async (questionId: string, payload: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payload }))
    try {
      const res = await http.post(`/api/mock-attempts/${attemptId}/answers`, { questionId, ...payload })
      if (!res.data?.success) throw new Error(res.data?.error)
      const graded = res.data.data
      if (graded.isCorrect !== undefined) {
        setView((prev) =>
          prev
            ? {
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? { ...q, isCorrect: graded.isCorrect, marksAwarded: graded.marksAwarded } : q
                ),
              }
            : prev
        )
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || "บันทึกคำตอบไม่สำเร็จ" })
    }
  }

  const unlockQuestion = async (questionId: string) => {
    if (!attemptId) return
    setUnlockingId(questionId)
    try {
      const res = await http.post(`/api/mock-attempts/${attemptId}/questions/${questionId}/unlock`)
      if (!res.data?.success) throw new Error(res.data?.error || "ปลดล็อคไม่สำเร็จ")
      const { practiceTokens, question } = res.data.data
      setView((prev) =>
        prev
          ? { ...prev, practiceTokens, questions: prev.questions.map((q) => (q.id === questionId ? question : q)) }
          : prev
      )
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { optionId: question.selectedOptionId || undefined, textAnswer: question.textAnswer || undefined },
      }))
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "ปลดล็อคไม่สำเร็จ" })
    } finally {
      setUnlockingId(null)
    }
  }

  const qList = view?.questions ?? []
  const answeredCount = useMemo(
    () => qList.reduce((count, q) => count + (isAnswered(answers[q.id]) ? 1 : 0), 0),
    [answers, qList]
  )
  const completionPercent = qList.length > 0 ? Math.round((answeredCount / qList.length) * 100) : 0

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
        โปรดเข้าสู่ระบบก่อนทำข้อสอบ
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">กำลังทำข้อสอบ</h1>
        {mode && (
          <div className="flex items-center gap-2">
            <Badge className={mode === "PRACTICE" ? "bg-cyan-100 text-cyan-700 border border-cyan-200" : "bg-orange-100 text-orange-700 border border-orange-200"}>
              {mode === "PRACTICE" ? "โหมดฝึกฝน" : "โหมดสอบจริง"}
            </Badge>
            {mode === "PRACTICE" && (
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                {view?.practiceTokens ?? "-"} token
              </Badge>
            )}
          </div>
        )}
      </div>

      {(loading || authLoading) && (
        <>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
        </>
      )}
      {error && <div className="text-destructive">{error}</div>}

      {!loading && !error && view && (
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{view.mockExam.title}</span>
              {mode === "REAL" ? (
                view.mockExam.timeLimit ? (
                  <span className={`flex items-center gap-1 text-base font-semibold ${remainingSeconds !== null && remainingSeconds <= 60 ? "text-destructive" : ""}`}>
                    <Clock className="h-4 w-4" />
                    {formatCountdown(remainingSeconds)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <InfinityIcon className="h-4 w-4" />
                    ไม่จำกัดเวลา
                  </span>
                )
              ) : null}
            </CardTitle>
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>ความคืบหน้า</span>
                <span>
                  {answeredCount}/{qList.length}
                </span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {qList.map((q, idx) => (
              <MockQuestionField
                key={q.id}
                index={idx}
                question={q}
                mode={mode!}
                value={answers[q.id] || {}}
                practiceTokens={view.practiceTokens}
                unlocking={unlockingId === q.id}
                onSave={(payload) => saveAnswer(q.id, payload)}
                onUnlock={unlockQuestion}
              />
            ))}

            <div className="flex justify-end pt-2">
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
