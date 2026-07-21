export async function fetchEbookPreviewUrl(ebookId: string): Promise<string | null> {
  const res = await fetch(`/api/ebooks/${encodeURIComponent(String(ebookId))}`, { cache: "no-store" })
  const json = await res.json().catch(() => ({} as any))
  return json?.data?.previewUrl || null
}
