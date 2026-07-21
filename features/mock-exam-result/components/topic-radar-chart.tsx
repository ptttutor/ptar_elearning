import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip as ChartTooltip, Legend as ChartLegend } from "chart.js"
import { Radar } from "react-chartjs-2"
import { Card, CardContent } from "@/components/ui/card"
import type { TopicBreakdown } from "@/features/mock-exam-result/types"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, ChartTooltip, ChartLegend)

export function TopicRadarChart({ topicBreakdown }: { topicBreakdown: TopicBreakdown[] }) {
  if (topicBreakdown.length === 0) return null

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-1">วิเคราะห์จุดที่ควรพัฒนา</h3>
        <p className="text-sm text-muted-foreground mb-4">สรุปคะแนนแยกตามเรื่องที่ข้อสอบวัด (%) ยิ่งใกล้ศูนย์กลางยิ่งควรทบทวนเพิ่ม</p>
        <div className="relative mx-auto h-[380px] w-full max-w-[420px]">
          <Radar
            data={{
              labels: topicBreakdown.map((t) => t.topicName),
              datasets: [
                {
                  label: "ทำได้ (%)",
                  data: topicBreakdown.map((t) => t.percent),
                  backgroundColor: "rgba(59, 130, 246, 0.35)",
                  borderColor: "rgb(59, 130, 246)",
                  borderWidth: 2,
                  pointBackgroundColor: "rgb(59, 130, 246)",
                  pointBorderColor: "#fff",
                  pointRadius: 5,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: "transparent" }, pointLabels: { font: { size: 13 } } },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const t = topicBreakdown[ctx.dataIndex]
                      return `${ctx.parsed.r.toFixed(0)}% (${t.correct}/${t.total})`
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className="mt-4 space-y-1.5">
          {topicBreakdown.map((t) => (
            <div key={t.topicId} className="flex items-center justify-between text-sm">
              <span className={t.isWeak ? "font-semibold text-destructive" : "text-foreground"}>{t.topicName}</span>
              <span className="text-muted-foreground">
                {t.correct}/{t.total} ({t.percent.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
        {topicBreakdown.some((t) => t.isWeak) && (
          <div className="mt-4 pt-4 border-t space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">คำแนะนำ</p>
            <ul className="list-disc list-inside space-y-1">
              {topicBreakdown
                .filter((t) => t.isWeak)
                .map((t) => (
                  <li key={t.topicId}>
                    ควรทบทวนเรื่อง <span className="font-semibold text-foreground">{t.topicName}</span> เพิ่มเติม (ทำถูก {t.correct} จาก {t.total} ข้อ)
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
