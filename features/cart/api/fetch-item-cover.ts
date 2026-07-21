export async function fetchCourseCover(courseId: string): Promise<{ id: string; cover: string; isPhysical: boolean }> {
  try {
    const res = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({}))
    const data = json?.data || {}
    return { id: courseId, cover: data?.coverImageUrl || "", isPhysical: Boolean(data?.isPhysical) }
  } catch {
    return { id: courseId, cover: "", isPhysical: false }
  }
}

export async function fetchEbookCover(ebookId: string): Promise<{ id: string; cover: string }> {
  try {
    const res = await fetch(`/api/ebooks/${encodeURIComponent(ebookId)}`, { cache: "no-store" })
    const json = await res.json().catch(() => ({}))
    return { id: ebookId, cover: json?.data?.coverImageUrl || "" }
  } catch {
    return { id: ebookId, cover: "" }
  }
}
