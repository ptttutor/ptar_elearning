import type { EbookMeta } from "@/features/profile-my-books/types"

const normalizeUrl = (u?: string | null): string => String(u || "").trim()

export type ResolvedEbookLink = { url: string; meta?: EbookMeta }

/**
 * Single source of truth for "given an order + ebook id, find the readable
 * file URL": check the order's embedded ebook, then its items, then fall
 * back to fetching the ebook record directly (which also gives us title/
 * cover/author to cache). Used both for the initial batch link-resolution
 * and the per-card "retry" button — those two used to duplicate this same
 * three-step lookup.
 */
export async function resolveEbookLink(orderId: string, ebookId: string): Promise<ResolvedEbookLink> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" })
    const json: any = await res.json().catch(() => ({}))

    let url = ""
    const fromOrder = json?.data?.ebook
    if (fromOrder && String(fromOrder?.id) === String(ebookId)) {
      url = normalizeUrl(fromOrder?.fileUrl || fromOrder?.previewUrl || "")
    }

    if (!url) {
      const items: any[] = Array.isArray(json?.data?.items) ? json.data.items : []
      const found = items.find((it: any) => String(it?.itemType || "").toUpperCase() === "EBOOK" && String(it?.itemId) === String(ebookId))
      if (found) url = normalizeUrl(found?.fileUrl || found?.previewUrl || "")
    }

    if (url) return { url }

    const ebookRes = await fetch(`/api/ebooks/${encodeURIComponent(String(ebookId))}`, { cache: "no-store" })
    const ebookJson: any = await ebookRes.json().catch(() => ({}))
    url = normalizeUrl(ebookJson?.data?.fileUrl || ebookJson?.data?.previewUrl || "")
    const meta: EbookMeta = {
      title: ebookJson?.data?.title ?? null,
      coverImageUrl: normalizeUrl(ebookJson?.data?.coverImageUrl ?? ""),
      author: ebookJson?.data?.author ?? null,
      fileUrl: url || null,
    }
    return { url, meta }
  } catch {
    return { url: "" }
  }
}
