import { useEffect, useMemo, useRef, useState } from "react"
import Player from "@vimeo/player"
import { fetchCourseDetail } from "@/features/course-player/api/fetch-course-detail"
import { postProgressUpdate } from "@/features/course-player/api/update-progress"
import { getEmbedSrc } from "@/features/course-player/video-embed"
import { progressToIndex } from "@/features/course-player/progress-math"
import type { Content, CourseDetail, FlatItem } from "@/features/course-player/types"

export function useCoursePlayer(courseId: string, userId: string | undefined, authLoading: boolean) {
  const [courseLoading, setCourseLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [viewedContentIds, setViewedContentIds] = useState<string[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [videoReplayVisible, setVideoReplayVisible] = useState(false)
  const [videoEmbedKey, setVideoEmbedKey] = useState(0)
  const videoFrameRef = useRef<HTMLIFrameElement | null>(null)
  const videoPlayerRef = useRef<Player | null>(null)

  // ---- Flatten chapters/contents for sequential navigation ----
  const flat: FlatItem[] = useMemo(() => {
    if (!course) return []
    const chaptersSorted = [...course.chapters].sort((a, b) => a.order - b.order)
    let idx = 0
    const items: FlatItem[] = []
    for (const ch of chaptersSorted) {
      const contentsSorted = [...ch.contents].sort((a, b) => a.order - b.order)
      for (const c of contentsSorted) items.push({ index: idx++, content: c, chapter: ch })
    }
    return items
  }, [course])

  const totalContents = flat.length

  const contentIndexMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const item of flat) m.set(item.content.id, item.index)
    return m
  }, [flat])

  // ---- Sync viewed content from enrollment; fallback to progress-based sequential fill ----
  useEffect(() => {
    if (!course) {
      setViewedContentIds([])
      return
    }
    const allIds = flat.map((f) => f.content.id)
    const enrollmentViewed = Array.isArray(course.enrollment?.viewedContentIds) ? course.enrollment.viewedContentIds : []
    if (enrollmentViewed.length > 0) {
      setViewedContentIds(enrollmentViewed.filter((id) => contentIndexMap.has(id)))
      return
    }
    const hi = progressToIndex(course.enrollment?.progress ?? 0, allIds.length)
    setViewedContentIds(hi >= 0 ? allIds.slice(0, hi + 1) : [])
  }, [course, flat, contentIndexMap])

  const selectedItem = useMemo(() => flat.find((f) => f.content.id === selectedContent?.id), [flat, selectedContent?.id])
  const currentChapter = selectedItem?.chapter
  const selectedEmbedSrc = useMemo(() => {
    if (!selectedContent || selectedContent.contentType !== "VIDEO") return null
    return getEmbedSrc(selectedContent.contentUrl)
  }, [selectedContent])
  const isSelectedVimeo = useMemo(() => selectedEmbedSrc?.includes("player.vimeo.com") ?? false, [selectedEmbedSrc])
  const selectedContentIndex = selectedItem?.index ?? -1
  const nextPlayableContent = useMemo(() => {
    if (selectedContentIndex === -1) return null
    for (let i = selectedContentIndex + 1; i < flat.length; i++) {
      const item = flat[i]
      if (item.content.contentType !== "VIDEO") continue
      if (!getEmbedSrc(item.content.contentUrl)) continue
      return item.content
    }
    return null
  }, [flat, selectedContentIndex])
  const viewedSet = useMemo(() => new Set(viewedContentIds), [viewedContentIds])
  const isCurrentCompleted = selectedContent ? viewedSet.has(selectedContent.id) : false
  const hasOverlay = videoReplayVisible && isSelectedVimeo
  const completedCount = viewedContentIds.filter((id) => contentIndexMap.has(id)).length

  const viewedProgress = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0
  const currentProgress = viewedContentIds.length > 0 ? viewedProgress : course?.enrollment?.progress || 0
  const progressText =
    currentProgress === 0
      ? "ยังไม่ได้เริ่มเรียน"
      : currentProgress < 25
        ? "เริ่มต้น"
        : currentProgress < 50
          ? "กำลังเรียน"
          : currentProgress < 75
            ? "เรียนแล้วครึ่งหนึ่ง"
            : currentProgress < 100
              ? "เกือบจบแล้ว"
              : "เรียนจบแล้ว"
  const progressColor =
    currentProgress === 0 ? "text-muted-foreground" : currentProgress < 100 ? "text-primary" : "text-green-600"

  // ---- Initial course load ----
  useEffect(() => {
    let active = true
    ;(async () => {
      if (!courseId || !userId) {
        if (!authLoading) setCourseLoading(false)
        return
      }
      try {
        setCourseLoading(true)
        const data = await fetchCourseDetail(courseId, userId)
        if (active) {
          setCourse(data)
          const firstChapter = [...data.chapters].sort((a, b) => a.order - b.order).find((ch) => ch.contents.length > 0)
          if (firstChapter) {
            setSelectedContent([...firstChapter.contents].sort((a, b) => a.order - b.order)[0])
          }
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดคอร์สไม่สำเร็จ")
      } finally {
        if (active) setCourseLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [courseId, userId, authLoading])

  // ---- Vimeo player: reset embed on src change, listen for "ended" ----
  useEffect(() => {
    setVideoReplayVisible(false)
    setVideoEmbedKey((key) => key + 1)
  }, [selectedEmbedSrc])

  useEffect(() => {
    if (!isSelectedVimeo || !selectedEmbedSrc) {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.unload().catch(() => {})
        videoPlayerRef.current = null
      }
      return
    }
    if (!videoFrameRef.current) return

    const player = new Player(videoFrameRef.current, { dnt: true })
    videoPlayerRef.current = player

    const handleEnded = async () => {
      setVideoReplayVisible(true)
      try {
        await player.unload()
      } catch {}
    }
    player.on("ended", handleEnded)

    return () => {
      player.off("ended", handleEnded)
      player.unload().catch(() => {})
      if (videoPlayerRef.current === player) videoPlayerRef.current = null
    }
  }, [isSelectedVimeo, selectedEmbedSrc, videoEmbedKey])

  // ---- Mark content completed: optimistic update, sync from API, rollback on failure ----
  const handleMarkCompleted = async (content: Content) => {
    if (!userId || !courseId || !course) return
    const idx = contentIndexMap.get(content.id)
    if (idx === undefined) return
    if (viewedSet.has(content.id)) return

    const total = totalContents
    const prevViewed = viewedContentIds
    const prevProgress = course?.enrollment?.progress ?? 0
    const prevStatus = course?.enrollment?.status ?? "ACTIVE"

    const nextSet = new Set(prevViewed)
    nextSet.add(content.id)
    const orderedIds = flat.map((f) => f.content.id)
    const nextViewed = orderedIds.filter((id) => nextSet.has(id))
    const optimisticProgress = total > 0 ? Math.round((nextViewed.length / total) * 100) : prevProgress

    setViewedContentIds(nextViewed)
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            enrollment: {
              ...prev.enrollment,
              progress: optimisticProgress,
              viewedContentIds: nextViewed,
              status: optimisticProgress >= 100 ? "COMPLETED" : prev.enrollment.status,
            },
          }
        : prev
    )

    const rollback = () => {
      setCourse((prev) =>
        prev ? { ...prev, enrollment: { ...prev.enrollment, progress: prevProgress, viewedContentIds: prevViewed, status: prevStatus } } : prev
      )
      setViewedContentIds(prevViewed)
    }

    setProgressLoading(true)
    try {
      const result = await postProgressUpdate(userId, courseId, content.id)
      const apiViewedRaw = result.viewedContentIds ?? result.data?.viewedContentIds ?? nextViewed
      const filteredApiViewed = orderedIds.filter((id) => apiViewedRaw.includes(id))
      const apiProgress = result.progress ?? result.data?.progress ?? optimisticProgress
      const apiStatus = result.status ?? result.data?.status ?? (apiProgress >= 100 ? "COMPLETED" : prevStatus)

      setCourse((prev) =>
        prev ? { ...prev, enrollment: { ...prev.enrollment, progress: apiProgress, viewedContentIds: filteredApiViewed, status: apiStatus } } : prev
      )
      setViewedContentIds(filteredApiViewed)
    } catch {
      rollback()
    } finally {
      setProgressLoading(false)
    }
  }

  const handleSelectContent = (content: Content, closeSidebar: () => void) => {
    setSelectedContent(content)
    setVideoReplayVisible(false)
    closeSidebar()
  }

  const handleReplayVideo = () => {
    setVideoReplayVisible(false)
    setVideoEmbedKey((key) => key + 1)
  }

  const handlePlayNextAvailable = (selectFn: (content: Content) => void) => {
    if (!nextPlayableContent) return
    selectFn(nextPlayableContent)
  }

  return {
    courseLoading,
    error,
    course,
    flat,
    totalContents,
    contentIndexMap,
    selectedContent,
    setSelectedContent,
    selectedItem,
    currentChapter,
    selectedEmbedSrc,
    isSelectedVimeo,
    nextPlayableContent,
    viewedSet,
    isCurrentCompleted,
    hasOverlay,
    completedCount,
    currentProgress,
    progressText,
    progressColor,
    progressLoading,
    videoReplayVisible,
    videoEmbedKey,
    videoFrameRef,
    handleMarkCompleted,
    handleSelectContent,
    handleReplayVideo,
    handlePlayNextAvailable,
  }
}
