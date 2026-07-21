"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HelpCircle, Clock, GraduationCap, BookOpen as BookIcon, School, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubjectOptions, getSubjectLabel, getGradeLevelOptions, getGradeLevelLabel } from "@/lib/constants"

type ApiMockExam = {
  id: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string | null
  timeLimit: number | null
  price: number
  discountPrice: number | null
  allowPracticeMode: boolean
  allowRealMode: boolean
  course?: { id: string; title: string } | null
  _count?: { questions: number }
}

function effectivePrice(exam: ApiMockExam) {
  if (!exam.price) return 0
  if (exam.discountPrice != null && exam.discountPrice < exam.price) return exam.discountPrice
  return exam.price
}

type ApiResponse = {
  success: boolean
  data: ApiMockExam[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const MOCK_EXAMS_API = "/api/mock-exams"
const PAGE_SIZE = 9

export default function MockExamsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("all")
  const [exams, setExams] = useState<ApiMockExam[]>([])
  const [totalExams, setTotalExams] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subjectOptions = [{ value: "all", label: "ทุกวิชา" }, ...getSubjectOptions()]
  const gradeLevelOptions = [{ value: "all", label: "ทุกระดับ" }, ...getGradeLevelOptions()]

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSubject, selectedGradeLevel])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE) })
        if (selectedSubject !== "all") params.set("subject", selectedSubject)
        if (selectedGradeLevel !== "all") params.set("gradeLevel", selectedGradeLevel)

        const res = await fetch(`${MOCK_EXAMS_API}?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: ApiResponse = await res.json()

        if (active) {
          setExams(Array.isArray(json?.data) ? json.data : [])
          setTotalExams(json?.pagination?.total ?? 0)
          setTotalPages(Math.max(1, json?.pagination?.totalPages ?? 1))
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load mock exams")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedSubject, selectedGradeLevel, currentPage])

  return (
    <>
      <div className="min-h-screen bg-background pt-0 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">ระบบจำลองสอบ</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              ฝึกทำโจทย์แบบไม่จับเวลา หรือจำลองสถานการณ์สอบจริงแบบจับเวลา ก่อนลงสนามจริง
            </p>
          </motion.div>

          <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <div className="flex items-center justify-center gap-2 text-foreground mb-3">
              <BookIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">เลือกวิชา</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {subjectOptions.map((s) => (
                <Button
                  key={s.value}
                  variant={selectedSubject === s.value ? "default" : "outline"}
                  className={`px-4 py-1.5 text-sm ${selectedSubject === s.value ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "hover:bg-primary/10 hover:border-primary"}`}
                  onClick={() => setSelectedSubject(s.value)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex items-center justify-center gap-2 text-foreground mb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">เลือกระดับ</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {gradeLevelOptions.map((g) => (
                <Button
                  key={g.value}
                  variant={selectedGradeLevel === g.value ? "default" : "outline"}
                  className={`px-5 py-2 ${selectedGradeLevel === g.value ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "hover:bg-primary/10 hover:border-primary"}`}
                  onClick={() => setSelectedGradeLevel(g.value)}
                >
                  {g.label}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer} initial="initial" animate="animate">
            {loading &&
              Array.from({ length: 6 }).map((_, idx) => (
                <motion.div key={`skeleton-${idx}`} variants={fadeInUp}>
                  <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

            {!loading && error && <div className="col-span-full text-center text-destructive">เกิดข้อผิดพลาด: {error}</div>}

            {!loading &&
              !error &&
              exams.map((exam) => (
                <motion.div key={exam.id} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 group">
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
                      {exam.description && (
                        <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{exam.description}</p>
                      )}

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
                          <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
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

                      <Link href={`/mock-exams/${exam.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">ดูรายละเอียด</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
    </>
  )
}
