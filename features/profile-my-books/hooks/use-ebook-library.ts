import { useEffect, useMemo, useState } from "react"
import { resolveEbookLink } from "@/features/profile-my-books/api/resolve-ebook-link"
import { fetchEbookMeta } from "@/features/profile-my-books/api/fetch-ebook-meta"
import { getPaidEbookEntries, linkKey } from "@/features/profile-my-books/selectors"
import type { EbookMeta, Order } from "@/features/profile-my-books/types"

/**
 * Owns the ebook link/metadata cache for the paid-ebook entries derived
 * from `orders`. Link resolution and metadata backfill both write into the
 * same `ebookMeta` cache, so they're kept in one hook rather than split
 * across hooks that would otherwise need to share that state awkwardly.
 */
export function useEbookLibrary(orders: Order[]) {
  const paidEbookEntries = useMemo(() => getPaidEbookEntries(orders), [orders])

  const [links, setLinks] = useState<Record<string, string>>({})
  const [linksLoading, setLinksLoading] = useState(false)
  const [ebookMeta, setEbookMeta] = useState<Record<string, EbookMeta>>({})

  // Batch-resolve links for every paid ebook that doesn't have one yet.
  useEffect(() => {
    let cancelled = false
    const loadLinks = async () => {
      const missing = paidEbookEntries.filter((e) => !links[linkKey(e.orderId, e.ebookId)])
      if (!missing.length) {
        setLinksLoading(false)
        return
      }
      try {
        setLinksLoading(true)
        const results = await Promise.all(
          missing.map(async (e) => {
            const resolved = await resolveEbookLink(e.orderId, e.ebookId)
            return { key: linkKey(e.orderId, e.ebookId), ebookId: e.ebookId, ...resolved }
          })
        )
        if (!cancelled) {
          setLinks((prev) => {
            const next = { ...prev }
            for (const r of results) next[r.key] = r.url
            return next
          })
          setEbookMeta((prev) => {
            const next = { ...prev }
            for (const r of results) if (r.meta) next[String(r.ebookId)] = r.meta
            return next
          })
        }
      } finally {
        if (!cancelled) setLinksLoading(false)
      }
    }
    if (paidEbookEntries.length) loadLinks()
    return () => {
      cancelled = true
    }
  }, [paidEbookEntries, links])

  // Defensive backfill: make sure every entry ends up with title/cover/author
  // even if link resolution above never needed to hit /api/ebooks/:id.
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const missingIds = paidEbookEntries.map((e) => e.ebookId).filter((id) => !ebookMeta[String(id)])
      if (!missingIds.length) return
      await Promise.all(
        missingIds.map(async (ebookId) => {
          try {
            const meta = await fetchEbookMeta(ebookId)
            if (!cancelled) setEbookMeta((prev) => ({ ...prev, [String(ebookId)]: meta }))
          } catch {}
        })
      )
    }
    if (paidEbookEntries.length) run()
    return () => {
      cancelled = true
    }
  }, [paidEbookEntries, ebookMeta])

  const retryLink = async (orderId: string, ebookId: string) => {
    const { url, meta } = await resolveEbookLink(orderId, ebookId)
    setLinks((prev) => ({ ...prev, [linkKey(orderId, ebookId)]: url }))
    if (meta) setEbookMeta((prev) => ({ ...prev, [String(ebookId)]: meta }))
  }

  return { paidEbookEntries, links, linksLoading, ebookMeta, retryLink }
}
