import { useEffect, useState } from "react"

export type PostSummary = { id: string; desktop?: string | null; mobile?: string | null; title?: string }

export function usePostSummaries(postType: string) {
  const [summaries, setSummaries] = useState<PostSummary[]>([])
  const [loadingSummaries, setLoadingSummaries] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingSummaries(true)
        const pageSize = 100
        const seen = new Set<string>()
        const all: PostSummary[] = []
        let page = 1
        let loops = 0
        while (!cancelled && loops < 20) {
          const params = new URLSearchParams({ postType, limit: String(pageSize), page: String(page) })
          const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" })
          const json = await res.json().catch(() => ({}))
          const list: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
          const mapped: PostSummary[] = list.map((p: any) => ({
            id: String(p?.id),
            desktop: p?.imageUrl || null,
            mobile: p?.imageUrlMobileMode || null,
            title: p?.title || "",
          }))
          const before = all.length
          for (const item of mapped) {
            if (item.id && !seen.has(item.id)) {
              seen.add(item.id)
              all.push(item)
            }
          }
          if (!list.length || list.length < pageSize || all.length === before) break
          page += 1
          loops += 1
        }
        if (!cancelled) setSummaries(all)
      } finally {
        if (!cancelled) setLoadingSummaries(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [postType])

  return { summaries, loadingSummaries }
}
