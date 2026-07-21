import { getBaseUrl } from "@/lib/get-base-url"
import type { TeachingImage } from "@/features/about/types"

const FALLBACK_IMAGES: TeachingImage[] = [
  { id: 1, src: "/placeholder.svg", alt: "บรรยากาศการเรียนในห้องเรียน", title: "บรรยากาศการเรียนในห้องเรียน" },
  { id: 2, src: "/placeholder.svg", alt: "บรรยากาศการเรียนในห้องเรียน", title: "บรรยากาศการเรียนในห้องเรียน" },
  { id: 3, src: "/placeholder.svg", alt: "บรรยากาศการเรียนในห้องเรียน", title: "บรรยากาศการเรียนในห้องเรียน" },
]

export async function fetchTeachingImages(): Promise<TeachingImage[]> {
  try {
    const baseUrl = await getBaseUrl()
    const params = new URLSearchParams({ postType: "บรรยากาศการเรียน", limit: "20" })
    const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`, { cache: "no-store" })
    const json: any = await res.json().catch(() => null)
    const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []

    const mapped: TeachingImage[] = list
      .map((p: any, idx: number) => ({
        id: p?.id ?? idx,
        src: p?.imageUrl || p?.imageUrlMobileMode || "",
        alt: p?.title || "บรรยากาศการเรียน",
        title: p?.title || "บรรยากาศการเรียน",
      }))
      .filter((s: TeachingImage) => !!s.src)

    return mapped.length ? mapped : FALLBACK_IMAGES
  } catch {
    return FALLBACK_IMAGES
  }
}
