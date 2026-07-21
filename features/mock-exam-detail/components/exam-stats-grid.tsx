import { Clock, HelpCircle } from "lucide-react"
import type { ApiMockExam } from "@/features/mock-exam-detail/types"

export function ExamStatsGrid({ exam }: { exam: ApiMockExam }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="rounded-lg border p-4 text-center">
        <HelpCircle className="mx-auto mb-1 h-5 w-5 text-primary" />
        <div className="text-lg font-bold">{exam._count?.questions ?? 0}</div>
        <div className="text-xs text-muted-foreground">ข้อ</div>
      </div>
      <div className="rounded-lg border p-4 text-center">
        <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
        <div className="text-lg font-bold">{exam.timeLimit ?? "-"}</div>
        <div className="text-xs text-muted-foreground">{exam.timeLimit ? "นาที" : "ไม่จำกัดเวลา"}</div>
      </div>
      <div className="rounded-lg border p-4 text-center">
        <div className="text-lg font-bold">{exam.passingMarks}</div>
        <div className="text-xs text-muted-foreground">คะแนนผ่าน</div>
      </div>
      <div className="rounded-lg border p-4 text-center">
        <div className="text-lg font-bold">{exam.attemptsAllowed}</div>
        <div className="text-xs text-muted-foreground">ครั้ง (สอบจริง)</div>
      </div>
    </div>
  )
}
