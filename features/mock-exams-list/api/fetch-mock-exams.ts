import type { ApiResponse } from "@/features/mock-exams-list/types"

export const PAGE_SIZE = 9

export type FetchMockExamsParams = { page: number; subject: string; gradeLevel: string }

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchMockExams(params: FetchMockExamsParams, baseUrl = ""): Promise<ApiResponse> {
  const p = new URLSearchParams({ page: String(params.page), limit: String(PAGE_SIZE) })
  if (params.subject !== "all") p.set("subject", params.subject)
  if (params.gradeLevel !== "all") p.set("gradeLevel", params.gradeLevel)

  const res = await fetch(`${baseUrl}/api/mock-exams?${p.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
