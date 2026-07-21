import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UiExam } from "@/features/exam-bank/types"

export function ExamCardSkeleton() {
  return (
    <div className="h-full">
      <Card className="h-full border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="h-8 w-8 rounded shimmer" />
            <div className="h-5 w-12 rounded shimmer" />
          </div>
          <div className="h-6 w-3/4 rounded shimmer" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-4 w-1/2 rounded shimmer mx-auto mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}

export function ExamCard({ exam, index, canDownload, color, onClick }: { exam: UiExam; index: number; canDownload: boolean; color: string; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.06 * index }} whileHover={{ y: -5 }} className="h-full">
      <Card
        className="h-full cursor-pointer transition-all duration-300 border-2 hover:shadow-xl"
        style={{ borderColor: color + "20" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color || "#000"
          e.currentTarget.style.backgroundColor = color + "05"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = color + "20"
          e.currentTarget.style.backgroundColor = ""
        }}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <FileText className="h-8 w-8 flex-shrink-0 mt-1" style={{ color }} />
            <Badge variant="secondary" className="text-white text-xs" style={{ backgroundColor: color }}>
              ปี {exam.year}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight text-foreground">{exam.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">{canDownload ? "คลิกเพื่อดูหรือดาวน์โหลด" : "คลิกเพื่อดูเฉลย"}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
