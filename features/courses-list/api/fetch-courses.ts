import type { ApiResponse, SubjectOption } from "@/features/courses-list/types"

export const PAGE_SIZE = 9
// Bounded, single-shot sample used only to build the subject/category filter
// options — not the course listing itself, so this never scales with catalog size.
export const CATEGORY_SAMPLE_LIMIT = 100

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchCourses(params: URLSearchParams, baseUrl = ""): Promise<ApiResponse> {
  const res = await fetch(`${baseUrl}/api/courses?${params.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

/** Derives the subject/category filter options from a bounded sample of courses. */
export async function fetchSubjectOptions(baseUrl = ""): Promise<SubjectOption[]> {
  try {
    const params = new URLSearchParams({ page: "1", limit: String(CATEGORY_SAMPLE_LIMIT) })
    const json = await fetchCourses(params, baseUrl)
    const list = Array.isArray(json?.data) ? json.data : []

    const subjectCategories = new Map<string, string>()
    list.forEach((course) => {
      const category = course?.category
      if (category?.id && category.name && /^คอร์ส/i.test(category.name)) {
        subjectCategories.set(category.id, category.name)
      }
    })

    const subjects = Array.from(subjectCategories, ([id, name]) => ({ id, name }))
    return [{ id: "all", name: "ทุกวิชา" }, ...subjects]
  } catch {
    return [{ id: "all", name: "ทุกวิชา" }]
  }
}
