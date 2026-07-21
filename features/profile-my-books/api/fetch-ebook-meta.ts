import type { EbookMeta } from "@/features/profile-my-books/types"

const normalizeUrl = (u?: string | null): string => String(u || "").trim()

export async function fetchEbookMeta(ebookId: string): Promise<EbookMeta> {
  const res = await fetch(`/api/ebooks/${encodeURIComponent(String(ebookId))}`, { cache: "no-store" })
  const json: any = await res.json().catch(() => ({}))
  return {
    title: json?.data?.title ?? null,
    coverImageUrl: normalizeUrl(json?.data?.coverImageUrl ?? ""),
    author: json?.data?.author ?? null,
    fileUrl: normalizeUrl(json?.data?.fileUrl || json?.data?.previewUrl || ""),
  }
}
