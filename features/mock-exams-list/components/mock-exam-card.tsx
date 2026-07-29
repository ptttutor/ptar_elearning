import { motion } from "framer-motion"
import Link from "next/link"
import { HelpCircle, Clock, School, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getSubjectLabel, getGradeLevelLabel } from "@/lib/constants"
import { effectivePrice, type ApiMockExam } from "@/features/mock-exams-list/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

export function MockExamCard({ exam }: { exam: ApiMockExam }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="h-full rounded-3xl card-3d group">
        <CardContent className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">{getSubjectLabel(exam.subject)}</Badge>
            {exam.gradeLevel && <Badge variant="outline">{getGradeLevelLabel(exam.gradeLevel)}</Badge>}
            {exam.price > 0 ? (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                ฿{effectivePrice(exam).toLocaleString()}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                ฟรี
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-card-foreground mb-2 text-balance line-clamp-2">{exam.title}</h3>
          {exam.description && <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{exam.description}</p>}

          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>{exam._count?.questions ?? 0} ข้อ</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{exam.timeLimit ? `${exam.timeLimit} นาที` : "ไม่จำกัดเวลา"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            {exam.allowPracticeMode && (
              <Badge variant="outline" className="border-border bg-secondary text-secondary-foreground">
                <School className="mr-1 h-3 w-3" />
                โหมดฝึกฝน
              </Badge>
            )}
            {exam.allowRealMode && (
              <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                <Zap className="mr-1 h-3 w-3" />
                โหมดสอบจริง
              </Badge>
            )}
          </div>

          <Button asChild className="w-full rounded-xl">
            <Link href={`/mock-exams/${exam.id}`}>ดูรายละเอียด</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
