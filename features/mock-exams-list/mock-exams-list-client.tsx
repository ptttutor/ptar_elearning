"use client"

import { motion } from "framer-motion"
import { BookOpen as BookIcon, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSubjectOptions, getGradeLevelOptions } from "@/lib/constants"
import { useMockExamsList } from "@/features/mock-exams-list/hooks/use-mock-exams-list"
import { FilterPills } from "@/features/mock-exams-list/components/filter-pills"
import { MockExamCard } from "@/features/mock-exams-list/components/mock-exam-card"
import { MockExamCardSkeleton } from "@/features/mock-exams-list/components/mock-exam-card-skeleton"
import type { ApiMockExam } from "@/features/mock-exams-list/types"

const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }

const subjectOptions = [{ value: "all", label: "ทุกวิชา" }, ...getSubjectOptions()]
const gradeLevelOptions = [{ value: "all", label: "ทุกระดับ" }, ...getGradeLevelOptions()]

export function MockExamsListClient({ initialExams, initialTotal, initialTotalPages }: { initialExams: ApiMockExam[]; initialTotal: number; initialTotalPages: number }) {
  const { selectedSubject, setSelectedSubject, selectedGradeLevel, setSelectedGradeLevel, exams, totalExams, totalPages, currentPage, setCurrentPage, loading, error } = useMockExamsList({
    initialExams,
    initialTotal,
    initialTotalPages,
  })

  return (
    <div className="min-h-screen bg-background pt-0 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">ระบบจำลองสอบ</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">ฝึกทำโจทย์แบบไม่จับเวลา หรือจำลองสถานการณ์สอบจริงแบบจับเวลา ก่อนลงสนามจริง</p>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <div className="flex items-center justify-center gap-2 text-foreground mb-3">
            <BookIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold">เลือกวิชา</span>
          </div>
          <FilterPills options={subjectOptions} value={selectedSubject} onChange={setSelectedSubject} size="sm" />
        </motion.div>

        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="flex items-center justify-center gap-2 text-foreground mb-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">เลือกระดับ</span>
          </div>
          <FilterPills options={gradeLevelOptions} value={selectedGradeLevel} onChange={setSelectedGradeLevel} size="lg" />
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" animate="animate">
          {loading && Array.from({ length: 6 }).map((_, idx) => <MockExamCardSkeleton key={`skeleton-${idx}`} />)}

          {!loading && error && <div className="col-span-full text-center text-destructive">เกิดข้อผิดพลาด: {error}</div>}

          {!loading && !error && exams.map((exam) => <MockExamCard key={exam.id} exam={exam} />)}
        </motion.div>

        {!loading && !error && totalExams > 0 && totalPages > 1 && (
          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              ก่อนหน้า
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              หน้า {currentPage} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              ถัดไป
            </Button>
          </div>
        )}

        {!loading && !error && totalExams === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-xl text-muted-foreground">ยังไม่มีข้อสอบจำลองในหมวดนี้</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
