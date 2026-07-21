import type { ExamDetail } from "@/features/exam-viewer/types"

export async function fetchExamDetail(id: string): Promise<ExamDetail> {
  const res = await fetch(`/api/exams/${encodeURIComponent(id)}?include=files`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json().catch(() => ({}))
  const detail: ExamDetail | null = json?.data || null
  if (!detail) throw new Error("ไม่พบข้อมูลข้อสอบ")
  return detail
}
