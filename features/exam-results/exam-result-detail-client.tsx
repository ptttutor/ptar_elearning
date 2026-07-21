"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { useExamResultDetail } from "@/features/exam-results/hooks/use-exam-result-detail"
import { ResultSummaryCard } from "@/features/exam-results/components/result-summary-card"
import { ResultQuestionReview } from "@/features/exam-results/components/result-question-review"

export function ExamResultDetailClient({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { result, loading, error } = useExamResultDetail(attemptId, (user as any)?.id)

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-lg p-6 text-gray-700">โปรดเข้าสู่ระบบ</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ผลการทำข้อสอบ</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/profile/my-courses/exam-results")}>
            ประวัติทั้งหมด
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            ย้อนกลับ
          </Button>
        </div>
      </div>

      {loading && (
        <>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40" />
          <Skeleton className="h-72" />
        </>
      )}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && result && (
        <>
          <ResultSummaryCard result={result} />

          {Array.isArray(result.questions) && result.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดข้อคำถาม</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.questions.map((q, idx) => (
                  <ResultQuestionReview key={q.id} question={q} index={idx} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
