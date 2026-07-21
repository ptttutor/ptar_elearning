import { useEffect, useState } from "react"
import { fetchExamResults } from "@/features/exam-results/api/fetch-exam-results"
import type { AttemptSummary } from "@/features/exam-results/types"

export function useExamResultsList(userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<AttemptSummary[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchExamResults(userId)
        if (active) setAttempts(data)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดประวัติไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [userId])

  return { attempts, loading, error }
}
