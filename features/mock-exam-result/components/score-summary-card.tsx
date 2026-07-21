import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ResultView } from "@/features/mock-exam-result/types"

export function ScoreSummaryCard({ result }: { result: ResultView }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-sm text-muted-foreground mb-1">{result.mockExam.title}</p>
        <div className="text-4xl font-bold text-foreground">
          {result.attempt.obtainedMarks}/{result.attempt.totalMarks}
        </div>
        <p className="text-muted-foreground mt-1">{result.attempt.percentage.toFixed(1)}%</p>
        <Badge className={`mt-3 ${result.attempt.passed ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
          {result.attempt.passed ? "ผ่าน" : "ไม่ผ่าน"}
        </Badge>
      </CardContent>
    </Card>
  )
}
