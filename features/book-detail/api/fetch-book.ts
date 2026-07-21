import type { Ebook } from "@/features/book-detail/types"

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchBookById(id: string, baseUrl = ""): Promise<Ebook | null> {
  const res = await fetch(`${baseUrl}/api/ebooks/${encodeURIComponent(id)}`, { cache: "no-store" })
  const json: { success: boolean; data: Ebook | null } = await res.json().catch(() => ({ success: false, data: null }))
  if (!res.ok || json?.success === false) throw new Error("โหลดข้อมูลไม่สำเร็จ")
  return json.data
}
