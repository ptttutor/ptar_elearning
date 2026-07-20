"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, HelpCircle, Clock, School, Zap, Loader2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/sections/footer"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import LoginModal from "@/components/login-modal"
import http from "@/lib/http"
import { getSubjectLabel, getGradeLevelLabel } from "@/lib/constants"

type ApiMockExam = {
  id: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string | null
  timeLimit: number | null
  price: number
  discountPrice: number | null
  passingMarks: number
  attemptsAllowed: number
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

export default function MockExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [exam, setExam] = useState<ApiMockExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [startingMode, setStartingMode] = useState<"PRACTICE" | "REAL" | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/mock-exams/${id}`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json?.error || `HTTP ${res.status}`)
        if (active) setExam(json.data)
      } catch (e: any) {
        if (active) setError(e?.message ?? "ไม่พบข้อสอบจำลองนี้")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  // REAL-mode payment gate: only matters once the exam has a price.
  useEffect(() => {
    if (!id || !isAuthenticated || !exam?.price) {
      setHasAccess(null)
      return
    }
    let active = true
    http
      .get(`/api/mock-exams/${id}/access`)
      .then((res) => {
        if (active && res.data?.success) setHasAccess(res.data.data.hasAccess)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [id, isAuthenticated, exam?.price])

  const startAttempt = async (mode: "PRACTICE" | "REAL") => {
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    if (!id) return
    if (mode === "REAL" && hasAccess === false) {
      router.push(`/checkout/mock-exam/${id}`)
      return
    }
    try {
      setStartingMode(mode)
      const res = await http.post(`/api/mock-exams/${id}/attempts`, { mode })
      const attemptId = res.data?.data?.attemptId
      if (!res.data?.success || !attemptId) {
        throw new Error(res.data?.error || "เริ่มทำข้อสอบไม่สำเร็จ")
      }
      router.push(`/mock-exams/attempt/${attemptId}`)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        router.push(`/checkout/mock-exam/${id}`)
        return
      }
      toast({
        variant: "destructive",
        title: e?.response?.data?.error || e?.message || "เริ่มทำข้อสอบไม่สำเร็จ",
      })
    } finally {
      setStartingMode(null)
    }
  }

  return (
    <>
      <Navigation />
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
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        <BookOpen className="mr-1 h-3 w-3" />
                        คอร์ส: {exam.course.title}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">{exam.title}</h1>
                  {exam.description && <p className="text-muted-foreground mb-6 text-pretty">{exam.description}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-lg border p-4 text-center">
                      <HelpCircle className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <div className="text-lg font-bold">{exam._count?.questions ?? 0}</div>
                      <div className="text-xs text-muted-foreground">ข้อ</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <div className="text-lg font-bold">{exam.timeLimit ?? "-"}</div>
                      <div className="text-xs text-muted-foreground">{exam.timeLimit ? "นาที" : "ไม่จำกัดเวลา"}</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-lg font-bold">{exam.passingMarks}</div>
                      <div className="text-xs text-muted-foreground">คะแนนผ่าน</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-lg font-bold">{exam.attemptsAllowed}</div>
                      <div className="text-xs text-muted-foreground">ครั้ง (สอบจริง)</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {exam.allowPracticeMode && (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="flex items-center gap-2 font-semibold">
                            <School className="h-4 w-4 text-cyan-600" />
                            โหมดฝึกฝน
                          </div>
                          <p className="text-sm text-muted-foreground">ไม่จับเวลา ปลดล็อคเฉลยทีละข้อด้วย token</p>
                        </div>
                        <Button
                          variant="outline"
                          disabled={startingMode !== null}
                          onClick={() => startAttempt("PRACTICE")}
                        >
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
                        <Button disabled={startingMode !== null} onClick={() => startAttempt("REAL")}>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
