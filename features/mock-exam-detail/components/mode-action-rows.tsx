import { Loader2, School, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { effectivePrice, type ApiMockExam } from "@/features/mock-exam-detail/types"

type ModeActionRowsProps = {
  exam: ApiMockExam
  startingMode: "PRACTICE" | "REAL" | null
  hasAccess: boolean | null
  onStart: (mode: "PRACTICE" | "REAL") => void
}

export function ModeActionRows({ exam, startingMode, hasAccess, onStart }: ModeActionRowsProps) {
  return (
    <div className="space-y-3">
      {exam.allowPracticeMode && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <School className="h-4 w-4 text-muted-foreground" />
              โหมดฝึกฝน
            </div>
            <p className="text-sm text-muted-foreground">ไม่จับเวลา ปลดล็อคเฉลยทีละข้อด้วย token</p>
          </div>
          <Button variant="outline" disabled={startingMode !== null} onClick={() => onStart("PRACTICE")}>
            {startingMode === "PRACTICE" ? <Loader2 className="h-4 w-4 animate-spin" /> : "เริ่มฝึกฝน"}
          </Button>
        </div>
      )}
      {exam.allowRealMode && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="h-4 w-4 text-orange-600" />
              โหมดสอบจริง
              {exam.price > 0 && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  ฿{effectivePrice(exam).toLocaleString()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">จับเวลา ทำได้ {exam.attemptsAllowed} ครั้ง</p>
          </div>
          <Button disabled={startingMode !== null} onClick={() => onStart("REAL")}>
            {startingMode === "REAL" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exam.price > 0 && hasAccess === false ? (
              `ซื้อข้อสอบชุดนี้ (฿${effectivePrice(exam).toLocaleString()})`
            ) : (
              "เริ่มทำข้อสอบจริง"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
