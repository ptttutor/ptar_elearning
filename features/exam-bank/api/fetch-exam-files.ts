import type { ExamFile } from "@/features/exam-bank/types"

function normalizeFiles(rawFiles: any[]): ExamFile[] {
  const normalized = (Array.isArray(rawFiles) ? rawFiles : [])
    .map((f: any) => {
      const url: string = f?.url || f?.fileUrl || f?.downloadUrl || f?.cloudinaryUrl || f?.filePath || ""
      const name: string = f?.name || f?.title || f?.filename || f?.originalName || f?.publicId || f?.fileName || "ไฟล์ PDF"
      const mime: string | undefined = f?.mime || f?.mimeType || f?.contentType || f?.fileType || undefined
      const isDownload = typeof f?.isDownload === "boolean" ? f.isDownload : undefined
      return url ? { id: f?.id, name, url, mime, isDownload } : null
    })
    .filter(Boolean) as ExamFile[]

  const pdfs = normalized.filter((f) => /pdf/i.test(f.mime || "") || /\.pdf(\?|$)/i.test(f.url))
  return pdfs.length > 0 ? pdfs : normalized
}

/** Two-tier lookup: the exam detail endpoint usually inlines `files`; if that comes back empty, fall back to the dedicated files endpoint. */
export async function fetchExamFiles(examId: string): Promise<ExamFile[]> {
  const res = await fetch(`/api/exams/${encodeURIComponent(examId)}?include=files`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json().catch(() => ({}))
  const detail = json?.data || json
  const rawFiles = detail?.files || detail?.data?.files || []
  const files = normalizeFiles(rawFiles)
  if (files.length > 0) return files

  try {
    const res2 = await fetch(`/api/exams/${encodeURIComponent(examId)}/files`, { cache: "no-store" })
    if (!res2.ok) return files
    const json2 = await res2.json().catch(() => ({}))
    const list = json2?.data || json2 || []
    return normalizeFiles(list)
  } catch {
    return files
  }
}
