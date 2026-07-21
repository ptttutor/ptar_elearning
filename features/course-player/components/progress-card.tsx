import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-gradient-to-r from-primary to-primary/90 h-2 rounded-full transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  )
}

type ProgressCardProps = {
  courseId: string
  hasUser: boolean
  currentProgress: number
  progressColor: string
  progressText: string
  progressLoading: boolean
  completedCount: number
  totalContents: number
}

export function ProgressCard({ courseId, hasUser, currentProgress, progressColor, progressText, progressLoading, completedCount, totalContents }: ProgressCardProps) {
  return (
    <Card className="bg-background border-border">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-muted-foreground">ความคืบหน้า</div>
          <div className={`flex items-center gap-2 font-medium ${progressColor}`}>
            <CheckCircle className="h-4 w-4" /> {currentProgress}%
          </div>
        </div>
        <ProgressBar progress={currentProgress} />
        <div className="flex justify-between items-center mt-2 text-xs">
          <span className={progressColor}>{progressText}</span>
          {progressLoading && <span className="text-muted-foreground">กำลังอัพเดท...</span>}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          เรียนแล้ว {completedCount} จาก {totalContents} เนื้อหา
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (!hasUser) return
              window.location.href = `/profile/my-courses/course/${encodeURIComponent(courseId)}/exams`
            }}
          >
            ทำข้อสอบของคอร์สนี้
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!hasUser) return
              window.location.href = `/profile/my-courses/exam-results`
            }}
          >
            ดูประวัติข้อสอบ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
