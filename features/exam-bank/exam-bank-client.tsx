"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import { useAuth } from "@/components/auth-provider"
import { useExamBank } from "@/features/exam-bank/hooks/use-exam-bank"
import { useCanDownload } from "@/features/exam-bank/hooks/use-can-download"
import { useExamFilesDialog } from "@/features/exam-bank/hooks/use-exam-files-dialog"
import { SearchAndYearFilter } from "@/features/exam-bank/components/search-and-year-filter"
import { CategoryPills, CategoryPillsSkeleton } from "@/features/exam-bank/components/category-pills"
import { ExamCard, ExamCardSkeleton } from "@/features/exam-bank/components/exam-card"
import { ExamDetailDialog } from "@/features/exam-bank/components/exam-detail-dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { ITEMS_PER_PAGE } from "@/features/exam-bank/api/fetch-exams"
import type { ApiExam, ExamCategory, UiExam } from "@/features/exam-bank/types"

const SKELETON_COUNT = 8

export function ExamBankClient({
  initialExams,
  initialTotal,
  initialCategories,
  initialYears,
  initialCanDownload,
}: {
  initialExams: ApiExam[]
  initialTotal: number
  initialCategories: ExamCategory[]
  initialYears: number[]
  initialCanDownload: boolean
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<UiExam | null>(null)

  const {
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedYear,
    setSelectedYear,
    yearOptions,
    searchTerm,
    setSearchTerm,
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    getCategoryColorById,
    normalizedSearch,
    uiExams,
    displayTotal,
    totalPages,
  } = useExamBank({ initialExams, initialTotal, initialCategories, initialYears })

  const canDownload = useCanDownload(initialCanDownload)
  const { files, filesLoading, filesError } = useExamFilesDialog(selectedExam)

  const effectiveYearOptions = yearOptions.length ? yearOptions : Array.from(new Set(data.map((e) => new Date(e.createdAt).getFullYear()))).sort((a, b) => b - a)

  const handleViewPDF = (examId: string, file?: { id?: string; url?: string | null }) => {
    if (!examId) return
    const params = new URLSearchParams()
    if (file?.id != null) params.set("fileId", String(file.id))
    else if (file?.url) params.set("fileUrl", String(file.url))
    const query = params.toString()
    router.push(`/exam-bank/view/${encodeURIComponent(examId)}${query ? `?${query}` : ""}`)
  }

  const handleDownload = async (downloadUrl: string, filename?: string) => {
    if (!downloadUrl || !canDownload) return
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }
    const url = `/api/proxy-download-pdf?url=${encodeURIComponent(downloadUrl)}${filename ? `&filename=${encodeURIComponent(filename)}` : ""}`
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = filename || "file"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      try {
        window.location.href = url
      } catch {}
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-accent pt-20">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">คลังข้อสอบ</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">รวบรวมข้อสอบฟิสิกส์และวิชาที่เกี่ยวข้องจากหลายปีการศึกษา พร้อมให้ดูและดาวน์โหลดฟรี</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
            <SearchAndYearFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedYear={selectedYear} onYearChange={setSelectedYear} yearOptions={effectiveYearOptions} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
            {loading ? <CategoryPillsSkeleton /> : <CategoryPills categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} getCategoryColorById={getCategoryColorById} />}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center mb-6">
            {!loading && (
              <p className="text-muted-foreground">
                พบข้อสอบ {displayTotal} รายการ
                {!normalizedSearch && (
                  <>
                    {" "}
                    • หน้า {Math.min(currentPage, totalPages)} / {totalPages}
                  </>
                )}
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading && Array.from({ length: SKELETON_COUNT }).map((_, idx) => <ExamCardSkeleton key={idx} />)}

            {!loading && error && <div className="col-span-full text-center text-destructive py-10">เกิดข้อผิดพลาด: {error}</div>}

            {!loading &&
              !error &&
              uiExams.map((exam, index) => (
                <ExamCard key={exam.id} exam={exam} index={index} canDownload={canDownload} color={getCategoryColorById(exam.categoryId)} onClick={() => setSelectedExam(exam)} />
              ))}
          </motion.div>

          {!loading && !error && !normalizedSearch && totalCount > ITEMS_PER_PAGE && (
            <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2">
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {!loading && !error && uiExams.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">ไม่พบข้อสอบที่ค้นหา</h3>
              <p className="text-muted-foreground/80">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-center mt-16 p-8 bg-gradient-to-r from-accent to-accent/80 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-4">ต้องการข้อสอบเพิ่มเติม?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">สมัครเรียนกับเราเพื่อเข้าถึงข้อสอบและเนื้อหาเพิ่มเติม พร้อมคำอธิบายและเทคนิคการแก้โจทย์จากอาจารย์เต้ย</p>
            <Link href="/courses">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full cursor-pointer">
                สมัครเรียนออนไลน์
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <ExamDetailDialog
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
        files={files}
        filesLoading={filesLoading}
        filesError={filesError}
        canDownload={canDownload}
        categoryColor={getCategoryColorById(selectedExam?.categoryId)}
        onViewPDF={handleViewPDF}
        onDownload={handleDownload}
      />

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      <style jsx global>{`
        .shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, rgba(229, 229, 229, 1) 0%, rgba(243, 244, 246, 1) 50%, rgba(229, 229, 229, 1) 100%);
          background-size: 200% 100%;
          animation: shimmerSlide 1.4s ease-in-out infinite;
        }
        @keyframes shimmerSlide {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  )
}
