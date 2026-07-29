"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import LoginModal from "@/components/login-modal"
import { getSubjectLabel, getGradeLevelLabel } from "@/lib/constants"
import { useMockExamDetail } from "@/features/mock-exam-detail/hooks/use-mock-exam-detail"
import { ExamStatsGrid } from "@/features/mock-exam-detail/components/exam-stats-grid"
import { ModeActionRows } from "@/features/mock-exam-detail/components/mode-action-rows"
import type { ApiMockExam } from "@/features/mock-exam-detail/types"

export function MockExamDetailClient({ id, initial }: { id: string; initial: ApiMockExam | null }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  const { exam, loading, error, startingMode, hasAccess, startAttempt } = useMockExamDetail(id, initial, isAuthenticated)

  return (
    <>
      <div className="min-h-screen bg-background pt-0 md:pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/mock-exams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปรายการข้อสอบจำลอง
          </Button>

          {loading && (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลด...
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground mb-4">{error}</p>
              <Link href="/mock-exams">
                <Button variant="outline">กลับไปรายการข้อสอบจำลอง</Button>
              </Link>
            </div>
          )}

          {!loading && !error && exam && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardContent className="p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">{getSubjectLabel(exam.subject)}</Badge>
                    {exam.gradeLevel && <Badge variant="outline">{getGradeLevelLabel(exam.gradeLevel)}</Badge>}
                    {exam.course && (
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        <BookOpen className="mr-1 h-3 w-3" />
                        คอร์ส: {exam.course.title}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">{exam.title}</h1>
                  {exam.description && <p className="text-muted-foreground mb-6 text-pretty">{exam.description}</p>}

                  <ExamStatsGrid exam={exam} />

                  <ModeActionRows exam={exam} startingMode={startingMode} hasAccess={hasAccess} onStart={(mode) => startAttempt(mode, () => setLoginOpen(true))} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
