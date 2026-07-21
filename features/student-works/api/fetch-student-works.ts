import { getBaseUrl } from "@/lib/get-base-url"
import type { WorkItem } from "@/features/student-works/types"

const FALLBACK_WORKS: WorkItem[] = [
  { id: 1, imageDesktop: "/student-work1.jpeg", imageMobile: "/student-work1.jpeg" },
  { id: 2, imageDesktop: "/student-work2.jpeg", imageMobile: "/student-work2.jpeg" },
  { id: 3, imageDesktop: "/student-work3.jpeg", imageMobile: "/student-work3.jpeg" },
]

export async function fetchStudentWorks(): Promise<WorkItem[]> {
  try {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams({ postType: "ผลงานนักเรียน", limit: "20" })
    const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`, { cache: "no-store" })
    const json: any = await res.json().catch(() => null)
    const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

    const mapped: WorkItem[] = list
      .map((p: any, idx: number) => {
        const desktop = p?.imageUrl || p?.imageUrlMobileMode || ""
        const mobile = p?.imageUrlMobileMode || p?.imageUrl || ""
        return { id: p?.id ?? idx, imageDesktop: desktop, imageMobile: mobile }
      })
      .filter((s: WorkItem) => !!(s.imageDesktop || s.imageMobile))

    return mapped.length ? mapped : FALLBACK_WORKS
  } catch {
    return FALLBACK_WORKS
  }
}
