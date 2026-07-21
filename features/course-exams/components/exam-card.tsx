import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExamTypeBadge, ExamStatusBadge, getAttemptsInfo } from "@/components/exam-badges"
import type { ExamItem } from "@/features/course-exams/types"

export function ExamCard({ courseId, exam }: { courseId: string; exam: ExamItem }) {
  const attemptText = getAttemptsInfo(exam.attempts ?? (exam as any)?.attemptCount ?? null, exam.maxAttempts)
  const disableStart = exam.canRetake === false
  const timeLimit = exam.timeLimit ?? exam.duration

  return (
    <Card className="bg-background border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate text-foreground">{exam.title || "ข้อสอบ"}</div>
            {exam.description && <div className="text-sm text-muted-foreground line-clamp-2">{exam.description}</div>}
          </div>
          <ExamTypeBadge type={exam.examType} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <ExamStatusBadge status={exam.status} />
          {exam.questionCount != null && (
            <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded">{exam.questionCount} ข้อ</span>
          )}
          {timeLimit != null && timeLimit > 0 && (
            <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded">เวลา {timeLimit} นาที</span>
          )}
          {attemptText && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
              {exam.canRetake === false ? "ทำครบแล้ว" : "ทำซ้ำได้"} ({attemptText})
            </span>
          )}
          {attemptText == null && typeof exam.canRetake === "boolean" && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
              {exam.canRetake ? "ทำซ้ำได้" : "ทำครบแล้ว"}
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <Link href={`/profile/my-courses/course/${encodeURIComponent(courseId)}/exams/${encodeURIComponent(exam.id)}`}>
            <Button className={`bg-primary hover:bg-primary/90 text-primary-foreground ${disableStart ? "opacity-80" : ""}`} disabled={disableStart}>
              {disableStart ? "ทำเสร็จแล้ว" : "เริ่มทำข้อสอบ"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
