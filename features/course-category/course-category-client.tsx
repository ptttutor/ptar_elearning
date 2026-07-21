"use client"

import { useIntroVideo } from "@/hooks/use-intro-video"
import { usePostSummaries } from "@/hooks/use-post-summaries"
import { useRecommendedCourses } from "@/hooks/use-recommended-courses"
import { IntroVideoPlayer } from "@/components/intro-video-player"
import { ContactLineButton } from "@/components/contact-line-button"
import { PostSummariesSection } from "@/features/course-category/components/post-summaries-section"
import { RecommendedCoursesSection } from "@/features/course-category/components/recommended-courses-section"
import type { CourseCategoryConfig } from "@/features/course-category/types"

export function CourseCategoryClient({ config }: { config: CourseCategoryConfig }) {
  const { videoSrc, loadingVideo, videoEnded, videoReloadKey, iframeRef, showVideoSection, handleRetryVideo } = useIntroVideo(
    config.videoPostType,
    { vimeoRich: config.vimeoRich }
  )
  const { summaries, loadingSummaries } = usePostSummaries(config.summaryPostType)
  const { courses, loading: loadingCourses } = useRecommendedCourses(config.recommendedCategory)

  return (
    <section className="min-h-screen bg-gradient-to-br from-background to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">{config.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">{config.description}</p>
        </div>

        {showVideoSection && (
          <div className="mb-16 flex items-center justify-center">
            <div className="aspect-video w-200 bg-gray-900 rounded-2xl overflow-hidden relative">
              <IntroVideoPlayer
                videoSrc={videoSrc}
                loadingVideo={loadingVideo}
                videoEnded={videoEnded}
                videoReloadKey={videoReloadKey}
                iframeRef={iframeRef}
                onRetry={handleRetryVideo}
                videoTitle={config.videoTitle}
                variant={config.vimeoRich ? "rich" : "simple"}
                endedMessage={config.endedMessage}
              />
            </div>
          </div>
        )}

        <div className="mb-16">
          <PostSummariesSection summaries={summaries} loading={loadingSummaries} cardBg={config.summaryCardBg} />
        </div>

        <RecommendedCoursesSection courses={courses} loading={loadingCourses} />

        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center gap-4">
            <p className="text-muted-foreground font-medium">ติดต่อสมัครเรียน?</p>
            <ContactLineButton />
          </div>
        </div>
      </div>
    </section>
  )
}
