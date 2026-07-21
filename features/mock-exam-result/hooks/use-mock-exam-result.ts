import { useEffect, useState } from "react"
import { fetchMockExamResult } from "@/features/mock-exam-result/api/fetch-result"
import type { ResultView } from "@/features/mock-exam-result/types"

export function useMockExamResult(attemptId: string, isAuthenticated: boolean, authLoading: boolean) {
  const [result, setResult] = useState<ResultView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !isAuthenticated || !attemptId) return
    let active = true
    ;(async () => {
      try {
        const data = await fetchMockExamResult(attemptId)
        if (active) setResult(data)
      } catch (e: any) {
        if (active) setError(e?.response?.data?.error || e?.message || "โหลดผลข้อสอบไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [authLoading, isAuthenticated, attemptId])

  return { result, loading, error }
}
