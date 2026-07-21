import http from "@/lib/http"
import type { ResultView } from "@/features/mock-exam-result/types"

export async function fetchMockExamResult(attemptId: string): Promise<ResultView> {
  const res = await http.get(`/api/mock-attempts/${attemptId}/result`)
  if (!res.data?.success) throw new Error(res.data?.error || "โหลดผลข้อสอบไม่สำเร็จ")
  return res.data.data
}
