"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { useMockExamResult } from "@/features/mock-exam-result/hooks/use-mock-exam-result"
import { ScoreSummaryCard } from "@/features/mock-exam-result/components/score-summary-card"
import { TopicRadarChart } from "@/features/mock-exam-result/components/topic-radar-chart"
import { QuestionReviewCard } from "@/features/mock-exam-result/components/question-review-card"
import { ImagePreviewDialog } from "@/features/mock-exam-result/components/image-preview-dialog"

export function MockExamResultClient({ attemptId }: { attemptId: string }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { result, loading, error } = useMockExamResult(attemptId, isAuthenticated, authLoading)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
          <ScoreSummaryCard result={result} />
          <TopicRadarChart topicBreakdown={result.topicBreakdown} />

          <div className="space-y-4">
            {result.questions.map((q, idx) => (
              <QuestionReviewCard key={q.id} question={q} index={idx} onPreviewImage={setPreviewImage} />
            ))}
          </div>
        </>
      )}

      <ImagePreviewDialog imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  )
}
