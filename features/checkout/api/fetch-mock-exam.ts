import type { CheckoutMockExam } from "@/features/checkout/types"

export async function fetchMockExamById(id: string): Promise<CheckoutMockExam> {
  const res = await fetch(`/api/mock-exams/${encodeURIComponent(id)}`, { cache: "no-store" })
  const json = await res.json().catch(() => ({ success: false }))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json.data
}
