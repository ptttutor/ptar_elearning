import { useEffect, useState } from "react"
import { fetchExamFiles } from "@/features/exam-bank/api/fetch-exam-files"
import type { ExamFile, UiExam } from "@/features/exam-bank/types"

export function useExamFilesDialog(selectedExam: UiExam | null) {
  const [filesLoading, setFilesLoading] = useState(false)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [files, setFiles] = useState<ExamFile[]>([])

  useEffect(() => {
    if (!selectedExam?.id) {
      setFiles([])
      setFilesError(null)
      setFilesLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setFilesLoading(true)
        setFilesError(null)
        setFiles([])
        const list = await fetchExamFiles(selectedExam.id)
        if (!cancelled) setFiles(list)
      } catch (e: any) {
        if (!cancelled) setFilesError(e?.message ?? "โหลดไฟล์ไม่สำเร็จ")
      } finally {
        if (!cancelled) setFilesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedExam])

  return { files, filesLoading, filesError }
}
