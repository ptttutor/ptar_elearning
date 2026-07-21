"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/login-modal"
import { useAuth } from "@/components/auth-provider"
import { useCoursePlayer } from "@/features/course-player/hooks/use-course-player"
import { CourseSidebar } from "@/features/course-player/components/course-sidebar"
import { VideoPlayerCard } from "@/features/course-player/components/video-player-card"
import { ProgressCard } from "@/features/course-player/components/progress-card"
import { RelatedContentGrid } from "@/features/course-player/components/related-content-grid"
import { CoursePlayerSkeleton } from "@/features/course-player/components/course-player-skeleton"

export function CoursePlayerClient({ courseId }: { courseId: string }) {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    courseLoading,
    error,
    course,
    contentIndexMap,
    selectedContent,
    setSelectedContent,
    currentChapter,
    selectedEmbedSrc,
    isSelectedVimeo,
    nextPlayableContent,
    viewedSet,
    isCurrentCompleted,
    hasOverlay,
    completedCount,
    totalContents,
    currentProgress,
    progressText,
    progressColor,
    progressLoading,
    videoEmbedKey,
    videoFrameRef,
    handleMarkCompleted,
    handleSelectContent,
    handleReplayVideo,
    handlePlayNextAvailable,
  } = useCoursePlayer(courseId, (user as any)?.id, authLoading)

  if (authLoading && !isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-background border rounded-lg p-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-background border rounded-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อดูคอร์สของคุณ</div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setLoginOpen(true)}>
              เข้าสู่ระบบ
            </Button>
          </div>
          <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
      </div>
    )
  }

  if (courseLoading) return <CoursePlayerSkeleton />

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="text-destructive mb-4">เกิดข้อผิดพลาด: {error || "ไม่พบคอร์ส"}</div>
        <Link href="/profile/my-courses">
          <Button variant="outline">กลับไปหน้าคอร์สของฉัน</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/profile/my-courses">
              <Button variant="ghost" size="sm" className="shrink-0">
                <ArrowLeft className="h-4 w-4 mr-2" /> กลับ
              </Button>
            </Link>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground line-clamp-1">{course.title}</h1>
          </div>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-4 w-4 mr-2" /> สารบัญคอร์ส
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <CourseSidebar
            chapters={course.chapters}
            currentChapterId={currentChapter?.id}
            selectedContentId={selectedContent?.id}
            contentIndexMap={contentIndexMap}
            viewedSet={viewedSet}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSelectChapter={(first) => handleSelectContent(first, () => setIsSidebarOpen(false))}
            onSelectContent={(content) => handleSelectContent(content, () => setIsSidebarOpen(false))}
          />

          <section className="lg:col-span-3 space-y-6">
            <VideoPlayerCard
              course={course}
              selectedContent={selectedContent}
              currentChapter={currentChapter}
              selectedEmbedSrc={selectedEmbedSrc}
              isSelectedVimeo={isSelectedVimeo}
              hasOverlay={hasOverlay}
              isCurrentCompleted={isCurrentCompleted}
              progressLoading={progressLoading}
              nextPlayableContent={nextPlayableContent}
              videoEmbedKey={videoEmbedKey}
              videoFrameRef={videoFrameRef}
              onMarkCompleted={handleMarkCompleted}
              onReplay={handleReplayVideo}
              onPlayNext={() => handlePlayNextAvailable((c) => setSelectedContent(c))}
            />

            <ProgressCard
              courseId={courseId}
              hasUser={Boolean((user as any)?.id)}
              currentProgress={currentProgress}
              progressColor={progressColor}
              progressText={progressText}
              progressLoading={progressLoading}
              completedCount={completedCount}
              totalContents={totalContents}
            />

            {currentChapter && (
              <RelatedContentGrid
                currentChapter={currentChapter}
                selectedContentId={selectedContent?.id}
                onSelectContent={(content) => handleSelectContent(content, () => setIsSidebarOpen(false))}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
