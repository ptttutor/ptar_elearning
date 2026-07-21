import { useEffect, useMemo, useState } from "react"
import { fetchExamDetail } from "@/features/exam-viewer/api/fetch-exam-detail"
import type { ActiveFile, ExamDetail } from "@/features/exam-viewer/types"

function normalizeFiles(detail: ExamDetail): ActiveFile[] {
  return (detail.files || [])
    .map((raw) => {
      const rawUrl = raw?.filePath ?? raw?.url ?? raw?.fileUrl ?? raw?.downloadUrl ?? raw?.cloudinaryUrl ?? ""
      const url = typeof rawUrl === "string" ? rawUrl : ""
      if (!url) return null
      const idValue = raw?.id
      const id = idValue != null ? String(idValue) : undefined
      const name = raw?.fileName ?? raw?.name ?? (raw as any)?.title ?? raw?.filename ?? raw?.originalName ?? raw?.publicId ?? "ไฟล์ข้อสอบ"
      const type = raw?.fileType ?? raw?.mimeType ?? raw?.mime ?? raw?.contentType ?? ""
      const isDownload = typeof raw?.isDownload === "boolean" ? raw.isDownload : undefined
      return { id, name, url, type, isDownload }
    })
    .filter(Boolean) as ActiveFile[]
}

export function useExamViewer(id: string, fileIdParam: string | null, fileUrlParam: string | null) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const detail = await fetchExamDetail(id)
        if (cancelled) return
        setExam(detail)

        const normalizedFiles = normalizeFiles(detail)
        const requestedFile =
          (fileIdParam ? normalizedFiles.find((f) => f.id === fileIdParam) : undefined) ??
          (fileUrlParam ? normalizedFiles.find((f) => f.url === fileUrlParam) : undefined)

        const pdfs = normalizedFiles.filter((f) => /pdf/i.test(f.type || "") || /\.pdf(\?|$)/i.test(f.url))
        const prioritized = pdfs.length > 0 ? pdfs : normalizedFiles
        const fallbackFile = prioritized[0] || null

        setActiveFile(requestedFile ?? fallbackFile)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, fileIdParam, fileUrlParam])

  const viewLabel = useMemo(() => {
    if (!activeFile) return "ดูข้อสอบ"
    return activeFile.isDownload === false ? "ดูเฉลย" : "ดูข้อสอบ"
  }, [activeFile])

  const resolvedFile = useMemo(() => {
    if (!activeFile) {
      return { viewerSrc: null as string | null, iframeSrc: null as string | null, isPdf: false }
    }
    const filename = activeFile.name || exam?.title || "exam.pdf"
    const viewerSrc = `/api/proxy-view?url=${encodeURIComponent(activeFile.url)}&filename=${encodeURIComponent(filename)}`
    const isPdf = /pdf/i.test(activeFile.type || "") || /\.pdf(?:\?|$)/i.test(activeFile.url) || /\.pdf$/i.test(filename)
    const iframeSrc = isPdf ? `${viewerSrc}#page=1&zoom=page-width` : viewerSrc
    return { viewerSrc, iframeSrc, isPdf }
  }, [activeFile, exam?.title])

  return { loading, error, exam, activeFile, viewLabel, resolvedFile }
}
