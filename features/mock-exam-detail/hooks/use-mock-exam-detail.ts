import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { checkMockExamAccess, fetchMockExamById, startMockExamAttempt } from "@/features/mock-exam-detail/api/mock-exam"
import type { ApiMockExam } from "@/features/mock-exam-detail/types"

export function useMockExamDetail(id: string, initial: ApiMockExam | null, isAuthenticated: boolean) {
  const router = useRouter()
  const { toast } = useToast()

  const [exam, setExam] = useState<ApiMockExam | null>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startingMode, setStartingMode] = useState<"PRACTICE" | "REAL" | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  // Server already fetched matching data for first paint; only refetch if `id` changes client-side.
  const [loadedFor, setLoadedFor] = useState(id)
  useEffect(() => {
    if (id === loadedFor) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchMockExamById(id)
        if (active) {
          setExam(data)
          setLoadedFor(id)
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "ไม่พบข้อสอบจำลองนี้")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, loadedFor])

  // REAL-mode payment gate: only matters once the exam has a price.
  useEffect(() => {
    if (!id || !isAuthenticated || !exam?.price) {
      setHasAccess(null)
      return
    }
    let active = true
    checkMockExamAccess(id).then((access) => {
      if (active) setHasAccess(access)
    })
    return () => {
      active = false
    }
  }, [id, isAuthenticated, exam?.price])

  const startAttempt = async (mode: "PRACTICE" | "REAL", onNeedsLogin: () => void) => {
    if (!isAuthenticated) {
      onNeedsLogin()
      return
    }
    if (!id) return
    if (mode === "REAL" && hasAccess === false) {
      router.push(`/checkout/mock-exam/${id}`)
      return
    }
    try {
      setStartingMode(mode)
      const attemptId = await startMockExamAttempt(id, mode)
      router.push(`/mock-exams/attempt/${attemptId}`)
    } catch (e: any) {
      if (e?.response?.status === 403) {
        router.push(`/checkout/mock-exam/${id}`)
        return
      }
      toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "เริ่มทำข้อสอบไม่สำเร็จ" })
    } finally {
      setStartingMode(null)
    }
  }

  return { exam, loading, error, startingMode, hasAccess, startAttempt }
}
