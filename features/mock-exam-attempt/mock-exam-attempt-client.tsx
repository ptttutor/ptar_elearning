"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Coins, Clock, Infinity as InfinityIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { formatCountdown } from "@/lib/format"
import MockQuestionField from "@/components/mock-exam/MockQuestionField"
import { useMockExamAttempt } from "@/features/mock-exam-attempt/hooks/use-mock-exam-attempt"

export function MockExamAttemptClient({ attemptId }: { attemptId: string }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
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
  } = useMockExamAttempt(attemptId, isAuthenticated, authLoading)

  if (!authLoading && !isAuthenticated) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">โปรดเข้าสู่ระบบก่อนทำข้อสอบ</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">กำลังทำข้อสอบ</h1>
        {mode && (
          <div className="flex items-center gap-2">
            <Badge className={mode === "PRACTICE" ? "bg-secondary text-secondary-foreground border border-border" : "bg-orange-100 text-orange-700 border border-orange-200"}>
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
