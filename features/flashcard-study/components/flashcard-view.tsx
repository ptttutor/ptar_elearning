"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkTypedAnswer } from "@/features/flashcard-study/lib/check-typed-answer"
import type { FlashcardAnswerMode, StudyCard } from "@/features/flashcard-study/types"

const MODE_LABEL: Record<FlashcardAnswerMode, string> = {
  SELF_GRADE: "พลิกเอง",
  MULTIPLE_CHOICE: "เลือกตอบ",
  TYPED: "พิมพ์ตอบ",
}
const OPTION_KEYS = ["ก", "ข", "ค", "ง", "จ", "ฉ"]

// 4-direction swipe → grade (plan.md §3.2). Swipe is a shortcut on top of the
// always-visible 4 grade buttons, never the only way to grade a card.
const SWIPE_DIRECTIONS = {
  left: { grade: 0, label: "ลืม", color: "#dc2626" },
  down: { grade: 3, label: "ยาก", color: "#d97706" },
  right: { grade: 4, label: "จำได้", color: "#16a34a" },
  up: { grade: 5, label: "ง่าย", color: "#2563eb" },
} as const
type SwipeDirection = keyof typeof SWIPE_DIRECTIONS
const SWIPE_THRESHOLD = 90

export function FlashcardView({
  card,
  submitting,
  onGrade,
}: {
  card: StudyCard
  submitting: boolean
  onGrade: (grade: number, answerMode: FlashcardAnswerMode, userAnswer?: string) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [typedValue, setTypedValue] = useState("")
  const [answered, setAnswered] = useState(false)
  const [verdict, setVerdict] = useState<{ kind: "ok" | "near" | "no"; grade: number } | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const dragInfo = useRef<{ dragging: boolean; moved: boolean; startX: number; startY: number } | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [activeDirection, setActiveDirection] = useState<SwipeDirection | null>(null)
  const [flying, setFlying] = useState(false)

  // Reset all per-card UI state whenever the queue advances to a new card.
  useEffect(() => {
    setFlipped(false)
    setSelectedOptionId(null)
    setTypedValue("")
    setAnswered(false)
    setVerdict(null)
    setDragOffset({ x: 0, y: 0 })
    setActiveDirection(null)
    setFlying(false)
    dragInfo.current = null
  }, [card.id])

  const dirOf = (dx: number, dy: number): SwipeDirection | null => {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return null
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (card.answerMode !== "SELF_GRADE" || submitting || flying) return
    dragInfo.current = { dragging: true, moved: false, startX: e.clientX, startY: e.clientY }
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const info = dragInfo.current
    if (!info?.dragging) return
    const dx = e.clientX - info.startX
    const dy = e.clientY - info.startY
    if (Math.hypot(dx, dy) > 6) info.moved = true
    setDragOffset({ x: dx, y: dy })
    setActiveDirection(dirOf(dx, dy))
  }

  const settle = () => {
    setDragOffset({ x: 0, y: 0 })
    setActiveDirection(null)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const info = dragInfo.current
    if (!info?.dragging) return
    const dx = e.clientX - info.startX
    const dy = e.clientY - info.startY
    info.dragging = false
    const dir = dirOf(dx, dy)
    const far = Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_THRESHOLD

    if (dir && far) {
      setFlying(true)
      onGrade(SWIPE_DIRECTIONS[dir].grade, "SELF_GRADE")
    } else {
      settle()
    }
  }

  const handlePointerCancel = () => {
    if (dragInfo.current) dragInfo.current.dragging = false
    settle()
  }

  const handleCardClick = () => {
    if (card.answerMode !== "SELF_GRADE" || answered || dragInfo.current?.moved) return
    setFlipped(true)
  }

  const pickOption = (optionId: string) => {
    if (answered || submitting) return
    setAnswered(true)
    setSelectedOptionId(optionId)
    const option = card.options.find((o) => o.id === optionId)
    setVerdict({ kind: option?.isCorrect ? "ok" : "no", grade: option?.isCorrect ? 4 : 0 })
  }

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault()
    if (answered || submitting) return
    setAnswered(true)
    const result = checkTypedAnswer(typedValue, card.acceptedAnswers, card.numericTolerance)
    setVerdict({ kind: result.kind, grade: result.grade })
  }

  const confirmGrade = (gradeValue: number) => {
    if (card.answerMode === "MULTIPLE_CHOICE") {
      onGrade(gradeValue, "MULTIPLE_CHOICE", selectedOptionId ?? undefined)
    } else if (card.answerMode === "TYPED") {
      onGrade(gradeValue, "TYPED", typedValue)
    } else {
      onGrade(gradeValue, "SELF_GRADE")
    }
  }

  const dragging = !!dragInfo.current?.dragging
  const cardTransform =
    flying && activeDirection
      ? {
          left: "translate(-140%, 0)",
          right: "translate(140%, 0)",
          up: "translate(0, -140%)",
          down: "translate(0, 140%)",
        }[activeDirection]
      : dragOffset.x !== 0 || dragOffset.y !== 0
        ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`
        : undefined

  return (
    <div>
      <div className="relative">
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleCardClick}
          style={{
            touchAction: card.answerMode === "SELF_GRADE" ? "none" : undefined,
            transform: cardTransform,
            opacity: flying ? 0 : 1,
            transition: dragging ? "none" : "transform .22s ease, opacity .22s ease",
          }}
          className={`relative select-none overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm min-h-[280px] flex flex-col items-center justify-center text-center px-6 py-10 gap-3 ${
            card.answerMode === "SELF_GRADE" ? "cursor-grab active:cursor-grabbing" : ""
          }`}
        >
          <span className="absolute top-3 right-4 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {MODE_LABEL[card.answerMode]}
          </span>

          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            {flipped ? "เฉลย" : "คำถาม"}
          </span>

          {card.frontImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.frontImage} alt="" className="max-w-[230px] rounded-md border" />
          )}

          <p className="text-xl font-semibold text-balance">{card.front}</p>

          {card.hint && !flipped && <p className="text-sm text-amber-600">💡 {card.hint}</p>}

          {card.answerMode === "SELF_GRADE" &&
            (flipped ? (
              <>
                <div className="w-14 h-px bg-border my-1" />
                {card.backImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.backImage} alt="" className="max-w-[230px] rounded-md border" />
                )}
                <p className="text-lg text-slate-700 dark:text-slate-200">{card.back}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-3">แตะการ์ดเพื่อดูเฉลย · หรือปัดการ์ดไปตามทิศ</p>
            ))}

          {card.answerMode === "MULTIPLE_CHOICE" && (
            <div className="grid gap-2 w-full max-w-md mt-1">
              {card.options.map((option, i) => {
                const stateClass = answered
                  ? option.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : option.id === selectedOptionId
                      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : ""
                  : "hover:border-slate-300"
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={answered}
                    onClick={() => pickOption(option.id)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${stateClass}`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
                      {OPTION_KEYS[i] ?? i + 1}
                    </span>
                    {option.optionText}
                  </button>
                )
              })}
            </div>
          )}

          {card.answerMode === "TYPED" && !answered && (
            <form onSubmit={submitTyped} className="flex gap-2 w-full max-w-md mt-1">
              <Input autoFocus value={typedValue} onChange={(e) => setTypedValue(e.target.value)} placeholder="พิมพ์คำตอบ…" disabled={submitting} />
              <Button type="submit" disabled={submitting || !typedValue.trim()}>
                ตรวจ
              </Button>
            </form>
          )}

          {answered && verdict && card.answerMode !== "SELF_GRADE" && (
            <div
              className={`w-full max-w-md rounded-lg px-4 py-3 text-sm font-medium ${
                verdict.kind === "ok"
                  ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900"
                  : verdict.kind === "near"
                    ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900"
                    : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900"
              }`}
            >
              {verdict.kind === "ok" ? "ถูกต้อง" : verdict.kind === "near" ? "เกือบถูก — สะกดเพี้ยนเล็กน้อย" : "ยังไม่ถูก"}
              <div className="mt-1 font-semibold">{card.back}</div>
            </div>
          )}

          {activeDirection && !flying && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ color: SWIPE_DIRECTIONS[activeDirection].color }}>
              <span className="rounded-xl border-2 bg-white px-6 py-2 text-2xl font-bold" style={{ borderColor: "currentColor" }}>
                {SWIPE_DIRECTIONS[activeDirection].label}
              </span>
            </div>
          )}
        </div>
      </div>

      {card.answerMode === "SELF_GRADE" && flipped && !flying && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <GradeButton label="ลืม" hint="ปัดซ้าย ←" color="text-red-600" onClick={() => confirmGrade(0)} disabled={submitting} />
          <GradeButton label="ยาก" hint="ปัดลง ↓" color="text-amber-600" onClick={() => confirmGrade(3)} disabled={submitting} />
          <GradeButton label="จำได้" hint="ปัดขวา →" color="text-green-600" onClick={() => confirmGrade(4)} disabled={submitting} />
          <GradeButton label="ง่าย" hint="ปัดขึ้น ↑" color="text-primary" onClick={() => confirmGrade(5)} disabled={submitting} />
        </div>
      )}

      {/* Optional difficulty adjustment after auto-grading — plan.md §3.1 keeps
          MC/TYPED SM-2 from going coarse (only 0/4 otherwise). Skippable. */}
      {card.answerMode !== "SELF_GRADE" && answered && verdict && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {verdict.grade >= 3 ? "ระบบให้คะแนนอัตโนมัติแล้ว — ปรับความยากได้ถ้าต้องการ" : "ตอบผิด — จะทบทวนใหม่พรุ่งนี้"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {verdict.grade >= 3 && (
              <Button variant="outline" size="sm" onClick={() => confirmGrade(3)} disabled={submitting}>
                ยากกว่านั้น
              </Button>
            )}
            <Button size="sm" onClick={() => confirmGrade(verdict.grade)} disabled={submitting}>
              ถัดไป →
            </Button>
            {verdict.grade >= 3 && (
              <Button variant="outline" size="sm" onClick={() => confirmGrade(5)} disabled={submitting}>
                ง่ายมาก
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GradeButton({
  label,
  hint,
  color,
  onClick,
  disabled,
}: {
  label: string
  hint: string
  color: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border bg-card px-2 py-3 text-center transition-colors hover:border-current disabled:opacity-50 ${color}`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="block text-[10px] mt-1 opacity-60">{hint}</span>
    </button>
  )
}
