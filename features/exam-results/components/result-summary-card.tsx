import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AttemptResult } from "@/features/exam-results/types"

export function ResultSummaryCard({ result }: { result: AttemptResult }) {
  const durationMinutes =
    result.startedAt && result.completedAt
      ? Math.max(0, Math.round((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 60000))
      : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{result.examTitle || "ข้อสอบ"}</span>
          <div className="flex items-center gap-2">
            {result.status && <Badge variant="secondary">{result.status}</Badge>}
            {typeof result.passed === "boolean" && (
              <Badge className={result.passed ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}>
                {result.passed ? "ผ่าน" : "ไม่ผ่าน"}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-gray-700">คอร์ส: {result.courseTitle || result.courseId}</div>
        {result.examDescription && <div className="text-xs text-gray-500">{result.examDescription}</div>}
        <div className="text-sm text-gray-700">
          คะแนน: {result.score ?? 0}
          {result.total != null ? `/${result.total}` : ""}
          {typeof result.percentage === "number" && !Number.isNaN(result.percentage) && (
            <span className="ml-2 text-xs text-gray-500">({Math.round(result.percentage)}%)</span>
          )}
        </div>
        {result.totalQuestions != null && result.correctAnswers != null && (
          <div className="text-sm text-gray-600">
            ถูก {result.correctAnswers}/{result.totalQuestions} ข้อ
          </div>
        )}
        <div className="text-xs text-gray-500">
          {result.attemptedAt ? new Date(result.attemptedAt).toLocaleString("th-TH") : null}
          {durationMinutes != null && <span className="ml-2 text-[11px] text-gray-400">ใช้เวลา {durationMinutes} นาที</span>}
        </div>
      </CardContent>
    </Card>
  )
}
