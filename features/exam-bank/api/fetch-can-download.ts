// Centralized download toggle, read off a specific "settings" exam record.
// When its files are all marked non-downloadable, hide download controls
// site-wide. Preserved as-is from the original implementation.
const SETTINGS_EXAM_ID = "e03395c1-cd6a-4cda-9da3-78e47a2981c5"

export async function fetchCanDownload(baseUrl = ""): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/exams/${SETTINGS_EXAM_ID}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: any = await res.json().catch(() => ({}))
    const data = json?.data ?? json ?? {}
    const flag = typeof data?.isDownload === "boolean" ? data.isDownload : Array.isArray(data?.files) ? data.files.some((f: any) => f?.isDownload !== false) : undefined
    return typeof flag === "boolean" ? flag : true
  } catch {
    return true
  }
}
