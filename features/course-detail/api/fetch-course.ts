import type { ApiChapter, ApiCourse } from "@/features/course-detail/types"

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchCourseDetail(id: string, baseUrl = ""): Promise<{ course: ApiCourse | null; chapters: ApiChapter[] }> {
  const res = await fetch(`${baseUrl}/api/courses/${encodeURIComponent(id)}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json: { success: boolean; data: ApiCourse | null } = await res.json()
  const course = json.data || null

  const inlineChapters = (json.data as any)?.chapters as ApiChapter[] | undefined
  if (inlineChapters && Array.isArray(inlineChapters)) {
    return { course, chapters: inlineChapters }
  }

  try {
    const cRes = await fetch(`${baseUrl}/api/courses/${encodeURIComponent(id)}/chapters`, { cache: "no-store" })
    if (cRes.ok) {
      const cJson: { success: boolean; data: ApiChapter[] } = await cRes.json()
      return { course, chapters: cJson.data || [] }
    }
  } catch {}

  return { course, chapters: [] }
}
