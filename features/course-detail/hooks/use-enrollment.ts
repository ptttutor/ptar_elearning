import { useEffect, useMemo, useState } from "react"
import { fetchIsEnrolled, fetchViewedContentIds, saveViewedContentIds } from "@/features/course-detail/api/enrollment"
import type { ApiChapter } from "@/features/course-detail/types"

export function useEnrollment(userId: string | undefined, courseId: string, isAuthenticated: boolean, chapters: ApiChapter[]) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [viewedIds, setViewedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !userId || !courseId) return
    let active = true
    fetchIsEnrolled(userId, courseId).then((found) => {
      if (active) setIsEnrolled(found)
    })
    return () => {
      active = false
    }
  }, [isAuthenticated, userId, courseId])

  useEffect(() => {
    if (!isAuthenticated || !userId || !courseId) return
    let active = true
    fetchViewedContentIds(userId, courseId).then((v) => {
      if (active) setViewedIds(v)
    })
    return () => {
      active = false
    }
  }, [isAuthenticated, userId, courseId])

  const totalContents = useMemo(() => chapters.reduce((acc, ch) => acc + (Array.isArray(ch.contents) ? ch.contents.length : 0), 0), [chapters])

  const progressPercent = useMemo(() => {
    if (!totalContents) return 0
    return Math.max(0, Math.min(100, Math.round((viewedIds.length / totalContents) * 100)))
  }, [viewedIds, totalContents])

  const toggleContentViewed = async (contentId: string, onNeedsLogin: () => void) => {
    if (!isAuthenticated || !userId) {
      onNeedsLogin()
      return
    }
    if (!isEnrolled) return
    const next = viewedIds.includes(contentId) ? viewedIds.filter((x) => x !== contentId) : [...viewedIds, contentId]
    setViewedIds(next)
    try {
      setSaving(true)
      await saveViewedContentIds(userId, courseId, next)
    } finally {
      setSaving(false)
    }
  }

  return { isEnrolled, viewedIds, saving, totalContents, progressPercent, toggleContentViewed }
}
