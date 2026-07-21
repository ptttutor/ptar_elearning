"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { ExamTypeBadge, ExamStatusBadge } from "@/components/exam-badges"
import { useExamAttempt } from "@/features/exam-attempt/hooks/use-exam-attempt"
import { useViewportWidth } from "@/features/exam-attempt/hooks/use-viewport-width"
import { QuestionCard } from "@/features/exam-attempt/components/question-card"
import { ExamSummaryPanel } from "@/features/exam-attempt/components/exam-summary-panel"
import { ExamSummarySidebar } from "@/features/exam-attempt/components/exam-summary-sidebar"
import { ExamSummaryDrawer } from "@/features/exam-attempt/components/exam-summary-drawer"

export function ExamAttemptClient({ courseId, examId }: { courseId: string; examId: string }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const viewportWidth = useViewportWidth()
  const isDesktop = (viewportWidth ?? 0) >= 1440

  const {
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
    remainingDisplay,
    submitting,
    setChoice,
    setText,
    submit,
  } = useExamAttempt(courseId, examId, (user as any)?.id)

  useEffect(() => {
    if (isDesktop) setSummaryOpen(true)
  }, [isDesktop])

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-lg p-6 text-gray-700">โปรดเข้าสู่ระบบ</div>
      </div>
    )
  }

  const summaryProps = exam
    ? {
        exam,
        totalQuestions,
        timeLimitMinutes,
        remainingSeconds,
        remainingDisplay,
        finishAtDisplay,
        startedAtDisplay,
        answeredCount,
        completionPercent,
      }
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">ทำข้อสอบ</h1>
        <Button variant="outline" onClick={() => history.back()}>
          ย้อนกลับ
        </Button>
      </div>

      {loading && (
        <>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
        </>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && exam && (
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">{exam.title || "ข้อสอบ"}</span>
              <div className="flex items-center gap-2">
                <ExamStatusBadge status={exam.status} />
                <ExamTypeBadge type={exam.examType} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.description && <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{exam.description}</div>}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <section className="flex-1 space-y-5">
                {qList.length === 0 && <div className="text-sm text-muted-foreground">ข้อสอบนี้ยังไม่มีคำถาม</div>}

                {qList.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    answer={answers[q.id]}
                    onChoice={(optionId) => setChoice(q.id, optionId)}
                    onText={(text) => setText(q.id, text)}
                  />
                ))}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => router.push(`/profile/my-courses/course/${encodeURIComponent(courseId)}/exams`)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
                  </Button>
                </div>
              </section>

              {isDesktop && summaryProps && (
                <ExamSummarySidebar>
                  <ExamSummaryPanel {...summaryProps} />
                </ExamSummarySidebar>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isDesktop && !loading && !error && exam && summaryProps && (
        <ExamSummaryDrawer open={summaryOpen} onToggle={() => setSummaryOpen((prev) => !prev)} onClose={() => setSummaryOpen(false)}>
          <ExamSummaryPanel {...summaryProps} />
        </ExamSummaryDrawer>
      )}
    </div>
  )
}
