import type { MutableRefObject } from "react"
import Image from "next/image"
import { Play, CheckCircle, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Chapter, Content, CourseDetail } from "@/features/course-player/types"

type VideoPlayerCardProps = {
  course: CourseDetail
  selectedContent: Content | null
  currentChapter?: Chapter
  selectedEmbedSrc: string | null
  isSelectedVimeo: boolean
  hasOverlay: boolean
  isCurrentCompleted: boolean
  progressLoading: boolean
  nextPlayableContent: Content | null
  videoEmbedKey: number
  videoFrameRef: MutableRefObject<HTMLIFrameElement | null>
  onMarkCompleted: (content: Content) => void
  onReplay: () => void
  onPlayNext: () => void
}

export function VideoPlayerCard({
  course,
  selectedContent,
  currentChapter,
  selectedEmbedSrc,
  isSelectedVimeo,
  hasOverlay,
  isCurrentCompleted,
  progressLoading,
  nextPlayableContent,
  videoEmbedKey,
  videoFrameRef,
  onMarkCompleted,
  onReplay,
  onPlayNext,
}: VideoPlayerCardProps) {
  return (
    <Card className="bg-background border-border pt-0">
      <CardContent className="p-0">
        <div className="aspect-video bg-black rounded-t-lg overflow-hidden relative" onContextMenu={(e) => e.preventDefault()}>
          {selectedContent && selectedContent.contentType === "VIDEO" && selectedEmbedSrc ? (
            <>
              <iframe
                key={isSelectedVimeo ? `video-${videoEmbedKey}` : "video"}
                ref={videoFrameRef}
                src={selectedEmbedSrc}
                className={`w-full h-full transition-opacity ${hasOverlay ? "pointer-events-none opacity-0" : "opacity-100"}`}
                frameBorder="0"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                title={selectedContent.title}
              />
              {hasOverlay && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/90 text-white px-6 text-center">
                  <div className="space-y-1">
                    <p className="text-lg sm:text-xl font-semibold">คุณดูวิดีโอนี้จบแล้ว</p>
                    <p className="text-sm text-white/80">เลือกดูซ้ำหรือเรียนบทต่อไป</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={onReplay} variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                      ดูอีกครั้ง
                    </Button>
                    <Button
                      onClick={() => selectedContent && onMarkCompleted(selectedContent)}
                      disabled={isCurrentCompleted || progressLoading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isCurrentCompleted ? "เรียนแล้ว" : progressLoading ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าเรียนแล้ว"}
                    </Button>
                    {nextPlayableContent && (
                      <Button
                        onClick={() => {
                          if (selectedContent && !isCurrentCompleted) onMarkCompleted(selectedContent)
                          onPlayNext()
                        }}
                        variant="ghost"
                        className="text-white hover:bg-white/10 hover:text-white"
                      >
                        เรียนบทต่อไป
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>ไม่สามารถเล่นวิดีโอได้</p>
              </div>
            </div>
          )}
        </div>

        {selectedContent && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-1">{selectedContent.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                    Chapter {currentChapter?.order}: {currentChapter?.title}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {nextPlayableContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedContent && !isCurrentCompleted) onMarkCompleted(selectedContent)
                      onPlayNext()
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" /> เรียนบทต่อไป
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => selectedContent && onMarkCompleted(selectedContent)}
                  disabled={isCurrentCompleted || progressLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isCurrentCompleted ? "เรียนแล้ว" : progressLoading ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าเรียนแล้ว"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Image src={course.coverImageUrl || "/placeholder.svg"} alt={course.title} width={40} height={28} className="rounded object-cover border" />
                <span className="truncate" title={course.title}>
                  {course.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> {course.stats.totalChapters} บทเรียน
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" /> {course.stats.totalContents} เนื้อหา
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="truncate">อาจารย์ {course.instructor.name}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
