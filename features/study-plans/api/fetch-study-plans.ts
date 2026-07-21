import { getBaseUrl } from "@/lib/get-base-url"
import type { GalleryImage } from "@/components/elegant-image-stack"

const FALLBACK_PLANS: GalleryImage[] = [
  { id: 1, imageDesktop: "/student-plan1.jpeg", imageMobile: "/student-plan1.jpeg" },
  { id: 2, imageDesktop: "/student-plan2.jpeg", imageMobile: "/student-plan2.jpeg" },
  { id: 3, imageDesktop: "/student-plan3.jpeg", imageMobile: "/student-plan3.jpeg" },
  { id: 4, imageDesktop: "/student-plan4.jpeg", imageMobile: "/student-plan4.jpeg" },
]

export async function fetchStudyPlans(): Promise<GalleryImage[]> {
  try {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams({ postType: "แผนการเรียน", limit: "20" })
    const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`, { cache: "no-store" })
    const json: any = await res.json().catch(() => null)
    const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

    const mapped: GalleryImage[] = list
      .map((p: any, idx: number) => {
        const desktop = p?.imageUrl || p?.imageUrlMobileMode || ""
        const mobile = p?.imageUrlMobileMode || p?.imageUrl || ""
        return { id: p?.id ?? idx, imageDesktop: desktop, imageMobile: mobile }
      })
      .filter((s: GalleryImage) => !!(s.imageDesktop || s.imageMobile))

    return mapped.length ? mapped : FALLBACK_PLANS
  } catch {
    return FALLBACK_PLANS
  }
}
