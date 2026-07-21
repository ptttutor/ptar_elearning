import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { fetchAttemptView, saveAttemptAnswer, submitAttempt, unlockAttemptQuestion } from "@/features/mock-exam-attempt/api/attempt"
import { isAnswered, type AnswerMap, type AttemptView } from "@/features/mock-exam-attempt/types"

export function useMockExamAttempt(attemptId: string, isAuthenticated: boolean, authLoading: boolean) {
  const router = useRouter()
  const { toast } = useToast()

  const [view, setView] = useState<AttemptView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [unlockingId, setUnlockingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const autoSubmitTriggered = useRef(false)

  const loadView = useCallback(async () => {
    if (!attemptId) return
    try {
      const data = await fetchAttemptView(attemptId)
      setView(data)
      setAnswers((prev) => {
        const seeded = { ...prev }
        for (const q of data.questions) {
          if (!seeded[q.id]) seeded[q.id] = { optionId: q.selectedOptionId || undefined, textAnswer: q.textAnswer || undefined }
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

  // REAL-mode countdown, computed from startedAt + timeLimit (deadline-based
  // so it survives clock drift/tab sleep, same approach as course exams).
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
      await submitAttempt(attemptId)
      router.replace(`/mock-exams/attempt/${attemptId}/result`)
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "ส่งข้อสอบไม่สำเร็จ" })
      setSubmitting(false)
    }
  }, [attemptId, router, submitting, toast])

  // Only REAL-mode attempts have a countdown; PRACTICE mode never triggers this
  // (remainingSeconds stays null, so it never equals 0).
  useEffect(() => {
    if (remainingSeconds !== 0 || autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true
    toast({ title: "หมดเวลาทำข้อสอบ", description: "ระบบได้ส่งคำตอบของคุณโดยอัตโนมัติ" })
    void submit()
  }, [remainingSeconds, submit, toast])

  const saveAnswer = async (questionId: string, payload: { optionId?: string; textAnswer?: string }) => {
    setAnswers((prev) => ({ ...prev, [questionId]: payload }))
    try {
      const graded = await saveAttemptAnswer(attemptId, questionId, payload)
      if (graded) {
        setView((prev) =>
          prev
            ? { ...prev, questions: prev.questions.map((q) => (q.id === questionId ? { ...q, isCorrect: graded.isCorrect, marksAwarded: graded.marksAwarded } : q)) }
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
      const { practiceTokens, question } = await unlockAttemptQuestion(attemptId, questionId)
      setView((prev) => (prev ? { ...prev, practiceTokens, questions: prev.questions.map((q) => (q.id === questionId ? question : q)) } : prev))
      setAnswers((prev) => ({ ...prev, [questionId]: { optionId: question.selectedOptionId || undefined, textAnswer: question.textAnswer || undefined } }))
    } catch (e: any) {
      toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "ปลดล็อคไม่สำเร็จ" })
    } finally {
      setUnlockingId(null)
    }
  }

  const qList = view?.questions ?? []
  const answeredCount = useMemo(() => qList.reduce((count, q) => count + (isAnswered(answers[q.id]) ? 1 : 0), 0), [answers, qList])
  const completionPercent = qList.length > 0 ? Math.round((answeredCount / qList.length) * 100) : 0

  return {
    view,
    mode,
    loading,
    error,
    answers,
    remainingSeconds,
    unlockingId,
    submitting,
    qList,
    answeredCount,
    completionPercent,
    submit,
    saveAnswer,
    unlockQuestion,
  }
}
