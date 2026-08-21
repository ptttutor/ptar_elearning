"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"
import { useFlashcardStudy } from "@/features/flashcard-study/hooks/use-flashcard-study"
import { FlashcardView } from "@/features/flashcard-study/components/flashcard-view"
import { StudySummary } from "@/features/flashcard-study/components/study-summary"

export function FlashcardStudyClient({ deckId }: { deckId: string }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { deck, cards, currentCard, index, reviewedCount, loading, error, submitting, isDone, isEmpty, grade } = useFlashcardStudy(
    deckId,
    isAuthenticated,
    authLoading
  )

  if (!authLoading && !isAuthenticated) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">โปรดเข้าสู่ระบบก่อนท่องแฟลชการ์ด</div>
  }

  const showLoading = loading || authLoading

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/flashcards" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          กลับไปรายการชุด
        </Link>
        {cards.length > 0 && !isDone && (
          <span className="text-sm text-muted-foreground tabular-nums">
            การ์ดที่ {Math.min(index + 1, cards.length)} / {cards.length}
          </span>
        )}
      </div>

      {showLoading && (
        <>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </>
      )}

      {!showLoading && error && <div className="text-destructive text-center py-12">{error}</div>}

      {!showLoading && !error && deck && (
        <>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{deck.title}</h1>
            {deck.description && <p className="text-sm text-muted-foreground mt-1">{deck.description}</p>}
          </div>

          {cards.length > 0 && !isDone && <Progress value={(index / cards.length) * 100} className="h-2" />}

          {isEmpty && (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="text-lg font-semibold mb-1">ไม่มีการ์ดให้ทบทวนตอนนี้</p>
              <p className="text-sm text-muted-foreground">กลับมาใหม่ภายหลัง หรือเลือกชุดแฟลชการ์ดอื่น</p>
              <Link href="/flashcards">
                <Button className="mt-6">กลับไปรายการชุด</Button>
              </Link>
            </div>
          )}

          {!isEmpty && !isDone && currentCard && <FlashcardView card={currentCard} submitting={submitting} onGrade={grade} />}

          {isDone && <StudySummary reviewedCount={reviewedCount} />}
        </>
      )}
    </div>
  )
}
