import { BookOpen, CheckCircle, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Chapter, Content } from "@/features/course-player/types"

type CourseSidebarProps = {
  chapters: Chapter[]
  currentChapterId?: string
  selectedContentId?: string
  contentIndexMap: Map<string, number>
  viewedSet: Set<string>
  isOpen: boolean
  onClose: () => void
  onSelectChapter: (first: Content) => void
  onSelectContent: (content: Content) => void
}

export function CourseSidebar({
  chapters,
  currentChapterId,
  selectedContentId,
  viewedSet,
  isOpen,
  onClose,
  onSelectChapter,
  onSelectContent,
}: CourseSidebarProps) {
  return (
    <aside className={`${isOpen ? "fixed inset-0 z-40 lg:static lg:z-auto" : "hidden lg:block"}`}>
      {isOpen && <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={onClose} />}

      <div className="absolute lg:static inset-y-0 left-0 w-11/12 sm:w-2/3 max-w-[380px] lg:w-auto bg-background border border-border rounded-none lg:rounded-md shadow-lg lg:shadow-none lg:sticky lg:top-24 h-full lg:h-[calc(100vh-8rem)] overflow-hidden">
        <Card className="h-full border-0">
          <CardContent className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-card-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> เนื้อหาคอร์ส
              </h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-2">
              {chapters
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((chapter) => {
                  const isOpenChapter = currentChapterId === chapter.id
                  const contentsSorted = [...chapter.contents].sort((a, b) => a.order - b.order)
                  return (
                    <div key={chapter.id} className="space-y-2">
                      <Button
                        variant={isOpenChapter ? "default" : "ghost"}
                        className={`w-full justify-start text-left h-auto p-3 ${
                          isOpenChapter ? "text-primary-foreground bg-primary hover:opacity-90" : "text-muted-foreground hover:bg-muted"
                        }`}
                        onClick={() => {
                          const first = contentsSorted[0]
                          if (first) onSelectChapter(first)
                        }}
                      >
                        <div>
                          <div className="font-medium text-balance">
                            Chapter {chapter.order}: {chapter.title}
                          </div>
                          <div className="text-xs opacity-80 text-pretty">{chapter.contents.length} เนื้อหา</div>
                        </div>
                      </Button>

                      {isOpenChapter && (
                        <div className="ml-4 space-y-1">
                          {contentsSorted.map((c) => {
                            const isCurrent = selectedContentId === c.id
                            const isCompleted = viewedSet.has(c.id)
                            return (
                              <Button
                                key={c.id}
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-left h-auto p-2 ${
                                  isCurrent ? " text-foreground border-l-2 border-l-primary" : "text-muted-foreground hover:bg-muted"
                                }`}
                                onClick={() => onSelectContent(c)}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {isCompleted ? (
                                    <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                                  ) : (
                                    <Play className="h-3 w-3 shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate text-balance">{c.title}</div>
                                  </div>
                                  {isCurrent && <span className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2" />}
                                </div>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
