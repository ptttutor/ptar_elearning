import type { MutableRefObject } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Users, BookOpen, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import type { ApiChapter, ApiCourse } from "@/features/course-detail/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }

type CourseHeroProps = {
  course: ApiCourse
  chapters: ApiChapter[]
  introSrc: string | null
  introPlayableSrc: string | null
  introFrameRef: MutableRefObject<HTMLIFrameElement | null>
  introSectionRef: MutableRefObject<HTMLDivElement | null>
  introReplayVisible: boolean
  introEmbedKey: number
  isIntroVimeo: boolean
  onIntroReplay: () => void
}

export function CourseHero({
  course,
  chapters,
  introSrc,
  introPlayableSrc,
  introFrameRef,
  introSectionRef,
  introReplayVisible,
  introEmbedKey,
  isIntroVimeo,
  onIntroReplay,
}: CourseHeroProps) {
  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="w-full max-w-full">
      <div ref={introSectionRef} className="mb-6">
        <AspectRatio ratio={16 / 9}>
          <div className="group relative h-full w-full overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-lg bg-black">
            {introSrc ? (
              <>
                <iframe
                  key={`intro-${introEmbedKey}`}
                  ref={introFrameRef}
                  src={introPlayableSrc || undefined}
                  className={`absolute inset-0 h-full w-full transition-opacity ${isIntroVimeo && introReplayVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  // "no-referrer" hides this site's origin from player.vimeo.com,
                  // which is exactly what Vimeo's domain-restricted embed privacy
                  // checks against — any video with that restriction enabled would
                  // refuse to play for every visitor. strict-origin-when-cross-origin
                  // (the browser default, matching course-player's video card) still
                  // lets Vimeo see the origin without leaking the full page URL.
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  title={`${course.title} - แนะนำคอร์ส`}
                  loading="lazy"
                />
                {isIntroVimeo && introReplayVisible && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/90 text-white p-4">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold">ชมวิดีโอตัวอย่างจบแล้ว</p>
                      <p className="text-sm text-white/80">กดปุ่มด้านล่างเพื่อชมซ้ำ</p>
                    </div>
                    <Button onClick={onIntroReplay} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      ดูอีกครั้ง
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Image src={course.coverImageUrl || "/placeholder.svg?height=400&width=700"} alt={course.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
              </>
            )}
          </div>
        </AspectRatio>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className="rounded-full bg-primary text-primary-foreground px-3 py-1 h-7">{course.category?.name ?? "คอร์ส"}</Badge>
        {course.instructor?.name && (
          <Badge variant="outline" className="rounded-full h-7 px-3">
            {course.instructor?.name}
          </Badge>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight break-words">{course.title}</h1>
      <p className="text-base text-muted-foreground mb-6 whitespace-pre-line break-words">{course.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">{course._count?.enrollments ?? 0} นักเรียน</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">{chapters.length} บทเรียน</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">{course.duration ?? "-"}</span>
        </div>
      </div>
    </motion.div>
  )
}
