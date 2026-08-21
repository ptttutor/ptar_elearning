"use client"

import { motion } from "framer-motion"
import { BookOpen as BookIcon, GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getSubjectOptions, getGradeLevelOptions } from "@/lib/constants"
import { useFlashcardsList } from "@/features/flashcards-list/hooks/use-flashcards-list"
import { FilterPills } from "@/features/flashcards-list/components/filter-pills"
import { DeckCard } from "@/features/flashcards-list/components/deck-card"
import { DeckCardSkeleton } from "@/features/flashcards-list/components/deck-card-skeleton"

const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }

const subjectOptions = [{ value: "all", label: "ทุกวิชา" }, ...getSubjectOptions()]
const gradeLevelOptions = [{ value: "all", label: "ทุกระดับ" }, ...getGradeLevelOptions()]

export function FlashcardsListClient() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { selectedSubject, setSelectedSubject, selectedGradeLevel, setSelectedGradeLevel, decks, loading, error } = useFlashcardsList(
    isAuthenticated,
    authLoading
  )

  if (!authLoading && !isAuthenticated) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">โปรดเข้าสู่ระบบเพื่อดูชุดแฟลชการ์ดของคุณ</div>
  }

  const showLoading = loading || authLoading

  return (
    <div className="min-h-screen bg-background pt-0 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">แฟลชการ์ด</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">ทบทวนเนื้อหาแบบ spaced repetition — ระบบจัดคิวการ์ดที่ถึงกำหนดทบทวนให้อัตโนมัติ</p>
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

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="initial" animate="animate">
          {showLoading && Array.from({ length: 6 }).map((_, idx) => <DeckCardSkeleton key={`skeleton-${idx}`} />)}

          {!showLoading && error && <div className="col-span-full text-center text-destructive">เกิดข้อผิดพลาด: {error}</div>}

          {!showLoading && !error && decks.map((deck) => <DeckCard key={deck.id} deck={deck} />)}
        </motion.div>

        {!showLoading && !error && decks.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-xl text-muted-foreground">ยังไม่มีชุดแฟลชการ์ดในหมวดนี้</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
