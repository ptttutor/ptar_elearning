import { Progress } from "@/components/ui/progress"
import type { ExamDetail } from "@/features/exam-attempt/types"

type ExamSummaryPanelProps = {
  exam: ExamDetail
  totalQuestions: number
  timeLimitMinutes: number | null
  remainingSeconds: number | null
  remainingDisplay: string
  finishAtDisplay: string | null
  startedAtDisplay: string | null
  answeredCount: number
  completionPercent: number
}

export function ExamSummaryPanel({
  exam,
  totalQuestions,
  timeLimitMinutes,
  remainingSeconds,
  remainingDisplay,
  finishAtDisplay,
  startedAtDisplay,
  answeredCount,
  completionPercent,
}: ExamSummaryPanelProps) {
  return (
    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
      {exam.courseTitle && (
        <div>
          คอร์ส: <span className="font-medium text-foreground">{exam.courseTitle}</span>
        </div>
      )}
      <div>
        จำนวนข้อ: <span className="font-medium text-foreground">{totalQuestions}</span>
      </div>
      {typeof exam.totalMarks === "number" && (
        <div>
          คะแนนรวม: <span className="font-medium text-foreground">{exam.totalMarks}</span>
        </div>
      )}
      {typeof exam.passingMarks === "number" && (
        <div>
          ผ่านเมื่อได้: <span className="font-medium text-foreground">{exam.passingMarks}</span>
        </div>
      )}
      {timeLimitMinutes != null && timeLimitMinutes > 0 && (
        <div>
          เวลาที่กำหนด: <span className="font-medium text-foreground">{timeLimitMinutes} นาที</span>
        </div>
      )}

      <div className="rounded-lg border bg-card px-3 py-2 text-sm text-foreground">
        <div className="flex items-center justify-between font-semibold text-foreground">
          <span>เวลาคงเหลือ</span>
          <span className={remainingSeconds !== null && remainingSeconds <= 60 ? "text-destructive" : ""}>{remainingDisplay}</span>
        </div>
        {finishAtDisplay && <div className="mt-1 text-xs text-muted-foreground">สิ้นสุด: {finishAtDisplay}</div>}
        {startedAtDisplay && <div className="text-xs text-muted-foreground">เริ่มทำเมื่อ: {startedAtDisplay}</div>}
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>ความคืบหน้า</span>
          <span>
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <Progress value={completionPercent} className="h-2" />
        <div className="text-right text-xs text-muted-foreground">{completionPercent}%</div>
      </div>

      {typeof exam.canRetake === "boolean" && (
        <div className="mt-4 rounded-xl border bg-card/80 p-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">เงื่อนไข:</span>
          <span className="ml-2">{exam.canRetake ? "สามารถกลับมาทำข้อสอบได้อีก" : "ทำได้เพียงครั้งเดียว"}</span>
        </div>
      )}
    </div>
  )
}
