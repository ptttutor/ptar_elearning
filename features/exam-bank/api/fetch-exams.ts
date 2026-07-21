import type { ApiExam, ApiExamsResponse } from "@/features/exam-bank/types"

export const ITEMS_PER_PAGE = 12
export const SEARCH_RESULTS_LIMIT = 200

export type FetchExamsParams = {
  page: number
  categoryId: string
  year: string
  search: string
}

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchExams(params: FetchExamsParams, baseUrl = ""): Promise<{ items: ApiExam[]; total: number }> {
  const q = params.search.trim()

  const buildParams = (opts: { useSearch: boolean; useQ: boolean }) => {
    const p = new URLSearchParams()
    p.set("page", String(params.page))
    p.set("limit", String(q ? SEARCH_RESULTS_LIMIT : ITEMS_PER_PAGE))
    if (params.categoryId !== "all") p.set("categoryId", params.categoryId)
    if (params.year !== "all") p.set("year", params.year)
    if (q) {
      if (opts.useSearch) p.set("search", q)
      if (opts.useQ) p.set("q", q)
    }
    return p
  }

  const attempt = async (useSearch: boolean, useQ: boolean) => fetch(`${baseUrl}/api/exams?${buildParams({ useSearch, useQ }).toString()}`, { cache: "no-store" })

  let res = await attempt(true, true)
  if (q && res.status >= 500) res = await attempt(false, true)
  if (q && res.status >= 500) res = await attempt(true, false)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const json: ApiExamsResponse | any = await res.json().catch(() => ({}))
  const items: ApiExam[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
  const total = json?.pagination?.total ?? json?.meta?.total ?? json?.total ?? json?.count ?? Number(res.headers.get("x-total-count")) ?? items.length

  return { items, total: Number.isFinite(Number(total)) ? Number(total) : items.length }
}
