import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { AttemptSummary } from "@/features/exam-results/types"

export function AttemptCard({ attempt }: { attempt: AttemptSummary }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-semibold">{attempt.examTitle || "ข้อสอบ"}</div>
          <div className="text-sm text-gray-600">คอร์ส: {attempt.courseTitle || attempt.courseId}</div>
          <div className="text-xs text-gray-500">
            {attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString("th-TH") : null}
            {typeof attempt.durationMinutes === "number" && attempt.durationMinutes >= 0 && (
              <span className="ml-2 text-[11px] text-gray-400">ใช้เวลา {attempt.durationMinutes} นาที</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {attempt.status && <Badge variant="secondary">{attempt.status}</Badge>}
          <div className="text-sm font-medium text-gray-700 text-right">
            <div>
              คะแนน: {attempt.score ?? 0}
              {attempt.total != null ? `/${attempt.total}` : ""}
            </div>
            {typeof attempt.percentage === "number" && !Number.isNaN(attempt.percentage) && (
              <div className="text-xs text-gray-500">{Math.round(attempt.percentage)}%</div>
            )}
            {attempt.totalQuestions != null && attempt.correctAnswers != null && (
              <div className="text-xs text-gray-500">
                ถูก {attempt.correctAnswers}/{attempt.totalQuestions} ข้อ
              </div>
            )}
          </div>
          <Link href={`/profile/my-courses/exam-results/${encodeURIComponent(attempt.id)}`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">ดูรายละเอียด</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
