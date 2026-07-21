import type { BookCategory, Ebook } from "@/features/books-list/types"

/** `baseUrl` is required server-side (absolute URL via getBaseUrl()); omit it client-side for a relative fetch. */
export async function fetchAllEbooks(baseUrl = ""): Promise<Ebook[]> {
  try {
    const res = await fetch(`${baseUrl}/api/ebooks`, { cache: "no-store" })
    const json = await res.json()
    return Array.isArray(json?.data) ? (json.data as Ebook[]) : []
  } catch {
    return []
  }
}

export async function fetchBookCategories(baseUrl = ""): Promise<BookCategory[]> {
  try {
    const res = await fetch(`${baseUrl}/api/ebook-categories`, { cache: "no-store" })
    const json: any = await res.json()
    const list: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []
    const mapped = list
      .filter((c) => c?.isActive !== false)
      .map((c: any, idx: number) => {
        const slug: string = c?.slug || String(c?.name || `cat-${idx}`).toLowerCase().replace(/\s+/g, "-")
        return { id: String(c?.id ?? slug), name: c?.name || slug, slug }
      })
    return [{ id: "all", name: "ทั้งหมด", slug: "" }, ...mapped]
  } catch {
    return [{ id: "all", name: "ทั้งหมด", slug: "" }]
  }
}
