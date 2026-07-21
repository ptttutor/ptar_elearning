export async function fetchItemCover(type: "COURSE" | "EBOOK" | string, id: string): Promise<string> {
  try {
    const endpoint = type === "EBOOK" ? `/api/ebooks/${encodeURIComponent(id)}` : `/api/courses/${encodeURIComponent(id)}`
    const res = await fetch(endpoint, { cache: "no-store" })
    const json: any = await res.json().catch(() => ({}))
    return json?.data?.coverImageUrl || json?.data?.imageUrl || json?.data?.thumbnailUrl || ""
  } catch {
    return ""
  }
}
