import { useEffect, useState } from "react"
import { fetchExamResultDetail } from "@/features/exam-results/api/fetch-exam-result-detail"
import type { AttemptResult } from "@/features/exam-results/types"

export function useExamResultDetail(attemptId: string, userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!attemptId || !userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchExamResultDetail(attemptId, userId)
        if (active) setResult(data)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดผลลัพธ์ไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [attemptId, userId])

  return { result, loading, error }
}
