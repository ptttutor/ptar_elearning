"use client"

import { motion } from "framer-motion"
import { useCoursesList } from "@/features/courses-list/hooks/use-courses-list"
import { GradeLevelSelector } from "@/features/courses-list/components/grade-level-selector"
import { SubjectSelector } from "@/features/courses-list/components/subject-selector"
import { CourseCard } from "@/features/courses-list/components/course-card"
import { CourseGridSkeleton } from "@/features/courses-list/components/course-grid-skeleton"
import { PaginationControls } from "@/features/courses-list/components/pagination-controls"
import type { ApiCourse, SubjectOption } from "@/features/courses-list/types"

const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }

type CoursesListClientProps = {
  initialGradeLevel: string
  initialCourses: ApiCourse[]
  initialTotal: number
  initialTotalPages: number
  initialSubjects: SubjectOption[]
}

export function CoursesListClient(props: CoursesListClientProps) {
  const {
    selectedGradeLevel,
    setSelectedGradeLevel,
    selectedSubject,
    setSelectedSubject,
    courses,
    totalCourses,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    availableSubjects,
  } = useCoursesList(props)

  return (
    <div className="min-h-screen bg-background pt-0 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">คอร์สเรียนทั้งหมด</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">เลือกคอร์สที่เหมาะกับเป้าหมายของคุณ เรียนกับต้าเคมีพี่ต้าผู้เชี่ยวชาญ</p>
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <GradeLevelSelector value={selectedGradeLevel} onChange={setSelectedGradeLevel} />
        </motion.div>

        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
          <SubjectSelector value={selectedSubject} options={availableSubjects} onChange={setSelectedSubject} />
        </motion.div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" animate="animate">
          {loading && <CourseGridSkeleton />}
          {!loading && error && <div className="col-span-full text-center text-destructive">เกิดข้อผิดพลาด: {error}</div>}
          {!loading && !error && courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </motion.div>

        {!loading && !error && totalCourses > 0 && (
          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-2">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}

        {!loading && !error && totalCourses === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-xl text-muted-foreground">ไม่พบคอร์สในหมวดหมู่นี้</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
