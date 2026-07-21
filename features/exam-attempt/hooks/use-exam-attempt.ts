import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { formatCountdown } from "@/lib/format"
import { fetchExamAttempt } from "@/features/exam-attempt/api/fetch-exam"
import { submitExamAttempt } from "@/features/exam-attempt/api/submit-exam"
import type { AnswerMap, ExamDetail } from "@/features/exam-attempt/types"

export function useExamAttempt(courseId: string, examId: string, userId: string | undefined) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const autoSubmitTriggered = useRef(false)

  // ---- Load exam ----
  useEffect(() => {
    let active = true
    ;(async () => {
      if (!courseId || !examId || !userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchExamAttempt(courseId, examId, userId)
        if (active) setExam(data)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดข้อสอบไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [courseId, examId, userId])

  const qList = useMemo(() => exam?.questions ?? [], [exam?.questions])
  const totalQuestions = exam?.totalQuestions ?? qList.length
  const answeredCount = useMemo(
    () =>
      qList.reduce((count, q) => {
        const answer = answers[q.id]
        if (!answer) return count
        if (answer.optionId || (answer.textAnswer && answer.textAnswer.trim().length > 0)) return count + 1
        return count
      }, 0),
    [answers, qList]
  )
  const completionPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0
  const timeLimitMinutes = exam?.timeLimit ?? exam?.duration ?? null
  const startedAtDisplay = useMemo(() => (exam?.startedAt ? new Date(exam.startedAt).toLocaleString("th-TH") : null), [exam?.startedAt])
  const finishAtDisplay = useMemo(() => {
    if (!timeLimitMinutes) return null
    const base = exam?.startedAt ? new Date(exam.startedAt).getTime() : Date.now()
    return new Date(base + timeLimitMinutes * 60_000).toLocaleString("th-TH")
  }, [exam?.startedAt, timeLimitMinutes])

  // ---- Countdown timer ----
  useEffect(() => {
    if (!timeLimitMinutes || timeLimitMinutes <= 0) {
      setRemainingSeconds(null)
      return
    }
    const startMs = exam?.startedAt ? new Date(exam.startedAt).getTime() : Date.now()
    const deadline = startMs + timeLimitMinutes * 60_000

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
    }, 1_000)

    return () => window.clearInterval(timer)
  }, [exam?.startedAt, timeLimitMinutes])

  const setChoice = (qid: string, optionId: string) => setAnswers((prev) => ({ ...prev, [qid]: { optionId } }))
  const setText = (qid: string, textAnswer: string) => setAnswers((prev) => ({ ...prev, [qid]: { textAnswer } }))

  const submit = useCallback(async () => {
    if (!userId || !courseId || !examId) return
    try {
      setSubmitting(true)
      const { attemptId } = await submitExamAttempt(courseId, examId, userId, qList, answers)
      if (attemptId) {
        router.replace(`/profile/my-courses/exam-results/${encodeURIComponent(attemptId)}`)
      } else {
        router.replace(`/profile/my-courses/exam-results`)
      }
    } catch (e: any) {
      setError(e?.message || "ส่งคำตอบไม่สำเร็จ")
    } finally {
      setSubmitting(false)
    }
  }, [answers, courseId, examId, qList, router, userId])

  // ---- Auto-submit when the countdown reaches zero ----
  useEffect(() => {
    autoSubmitTriggered.current = false
  }, [exam?.id])

  useEffect(() => {
    if (remainingSeconds !== 0) return
    if (submitting || autoSubmitTriggered.current) return
    autoSubmitTriggered.current = true
    toast({ title: "หมดเวลาทำข้อสอบ", description: "ระบบได้ส่งคำตอบของคุณโดยอัตโนมัติ", duration: 6000 })
    void submit()
  }, [remainingSeconds, submitting, submit, toast])

  return {
    loading,
    error,
    exam,
    qList,
    totalQuestions,
    answers,
    answeredCount,
    completionPercent,
    timeLimitMinutes,
    startedAtDisplay,
    finishAtDisplay,
    remainingSeconds,
    remainingDisplay: formatCountdown(remainingSeconds),
    submitting,
    setChoice,
    setText,
    submit,
  }
}
