import { AnimatePresence, motion } from "framer-motion"
import { BookOpen, Clock, ChevronDown, Play, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ApiChapter } from "@/features/course-detail/types"

function formatMinutes(mins: number) {
  if (!Number.isFinite(mins)) return "-"
  if (mins < 60) return `${mins} นาที`
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`
}

type ChaptersPanelProps = {
  chapters: ApiChapter[]
  totalMinutes: number | null
  totalContents: number
  progressPercent: number
  saving: boolean
  isEnrolled: boolean
  viewedIds: string[]
  activeChapterId: string | null
  onSetActiveChapter: (id: string | null) => void
  onPreviewClick: () => void
  onToggleContentViewed: (contentId: string) => void
}

export function ChaptersPanel({
  chapters,
  totalMinutes,
  totalContents,
  progressPercent,
  saving,
  isEnrolled,
  viewedIds,
  activeChapterId,
  onSetActiveChapter,
  onPreviewClick,
  onToggleContentViewed,
}: ChaptersPanelProps) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardHeader className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CardTitle className="text-xl">Course Overview</CardTitle>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {chapters.length} บทเรียน
            </div>
            {typeof totalMinutes === "number" && (
              <div className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatMinutes(totalMinutes)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-4">
        {totalContents > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm text-card-foreground mb-2">
              <div>ความคืบหน้า</div>
              <div className="font-semibold">
                {progressPercent}% {saving ? "(บันทึก...)" : ""}
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/90 transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {chapters.length === 0 ? (
          <div className="text-muted-foreground">ยังไม่มีบทเรียนในคอร์สนี้ </div>
        ) : (
          <div id="chapters" className="space-y-3">
            {chapters
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((ch, idx) => {
                const number = (ch.order ?? idx + 1).toString().padStart(2, "0")
                const expanded = activeChapterId === ch.id
                return (
                  <div key={ch.id} className="p-3 rounded-xl border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-border hover:border-primary/60 hover:bg-primary/5 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSetActiveChapter(activeChapterId === ch.id ? null : ch.id)}
                        aria-expanded={expanded}
                        aria-controls={`chapter-panel-${ch.id}`}
                        className="flex items-center gap-3 min-w-0 w-full group/hd cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-lg pr-2"
                      >
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-sm ring-1 ring-black/5">{number}</div>
                        <div className="truncate text-left flex-1">
                          <div className="font-medium text-card-foreground truncate flex items-center gap-2">{ch.title}</div>
                        </div>
                        <ChevronDown className={`ml-auto sm:ml-2 h-5 w-5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : "rotate-0"}`} aria-hidden="true" />
                      </button>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 self-end sm:self-center">
                        {typeof ch.duration === "number" && (
                          <div className="hidden sm:inline-flex items-center gap-1 text-xs">
                            <Clock className="h-4 w-4" /> {ch.duration} นาที
                          </div>
                        )}
                        {ch.isFreePreview ? (
                          <Button variant="ghost" size="sm" className="text-[#004B7D] hover:bg-[#004B7D1A] rounded-lg h-8 px-2" onClick={(e) => { e.stopPropagation(); onPreviewClick() }}>
                            <Play className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">ดูตัวอย่าง</span>
                          </Button>
                        ) : isEnrolled ? (
                          <Button variant="ghost" size="sm" className="text-[#004B7D] hover:bg-[#004B7D1A] rounded-lg h-8 px-2" onClick={(e) => e.stopPropagation()}>
                            <Play className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">เริ่มเรียน</span>
                          </Button>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-gray-400 text-xs">
                            <Lock className="h-4 w-4" /> <span className="hidden sm:inline">เฉพาะผู้ลงทะเบียน</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {Array.isArray(ch.contents) && ch.contents.length > 0 && expanded && (
                        <motion.div
                          id={`chapter-panel-${ch.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-1.5 border-l-2 border-primary/30 pl-3">
                            {ch.contents
                              .slice()
                              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                              .map((ct) => {
                                const checked = viewedIds.includes(ct.id)
                                return (
                                  <div key={ct.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-primary/10">
                                    <div className="text-sm text-foreground truncate pr-2">• {ct.title}</div>
                                    <div className="flex items-center gap-3">
                                      {isEnrolled ? (
                                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                                          <input type="checkbox" className="accent-primary h-4 w-4" checked={checked} onChange={() => onToggleContentViewed(ct.id)} />
                                          <span className="hidden sm:inline">เรียนแล้ว</span>
                                        </label>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">ล็อก</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
