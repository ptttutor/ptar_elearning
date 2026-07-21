import http from "@/lib/http"
import type { ApiMockExam } from "@/features/mock-exam-detail/types"

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchMockExamById(id: string, baseUrl = ""): Promise<ApiMockExam> {
  const res = await fetch(`${baseUrl}/api/mock-exams/${id}`, { cache: "no-store" })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json?.error || `HTTP ${res.status}`)
  return json.data
}

export async function checkMockExamAccess(id: string): Promise<boolean | null> {
  try {
    const res = await http.get(`/api/mock-exams/${id}/access`)
    if (res.data?.success) return res.data.data.hasAccess
    return null
  } catch {
    return null
  }
}

export async function startMockExamAttempt(id: string, mode: "PRACTICE" | "REAL"): Promise<string> {
  const res = await http.post(`/api/mock-exams/${id}/attempts`, { mode })
  const attemptId = res.data?.data?.attemptId
  if (!res.data?.success || !attemptId) {
    throw new Error(res.data?.error || "เริ่มทำข้อสอบไม่สำเร็จ")
  }
  return attemptId
}
