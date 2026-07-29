import { Download, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ExamFile, UiExam } from "@/features/exam-bank/types"

const MAX_FILE_NAME_LENGTH = 23

const formatFileName = (value?: string | null, fallback = "ไฟล์ PDF") => {
  const safe = (value ?? "").trim() || fallback
  if (safe.length <= MAX_FILE_NAME_LENGTH) return safe
  return `${safe.slice(0, MAX_FILE_NAME_LENGTH - 1)}…`
}

type ExamDetailDialogProps = {
  exam: UiExam | null
  onClose: () => void
  files: ExamFile[]
  filesLoading: boolean
  filesError: string | null
  canDownload: boolean
  categoryColor: string
  onViewPDF: (examId: string, file?: { id?: string; url?: string | null }) => void
  onDownload: (url: string, filename?: string) => void
}

export function ExamDetailDialog({ exam, onClose, files, filesLoading, filesError, canDownload, categoryColor, onViewPDF, onDownload }: ExamDetailDialogProps) {
  return (
    <Dialog open={!!exam} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{exam?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">หมวดหมู่:</span>
              <p className="font-semibold">{exam?.examType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">ปี:</span>
              <p className="font-semibold">{exam?.year}</p>
            </div>
          </div>

          <div className="pt-2">
            {filesLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-md border p-2">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded shimmer" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded shimmer" />
                        <div className="h-3 w-1/3 rounded shimmer" />
                      </div>
                      <div className="h-8 w-24 rounded shimmer" />
                      <div className="h-8 w-10 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!filesLoading && filesError && <p className="text-center text-destructive py-2">{filesError}</p>}

            {!filesLoading && !filesError && files.length === 0 && <p className="text-center text-muted-foreground py-2">ไม่พบไฟล์สำหรับข้อสอบนี้</p>}

            {!filesLoading && !filesError && files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div key={f.id || idx} className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-foreground truncate" title={f.name || "ไฟล์ PDF"}>
                          {formatFileName(f.name)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => onViewPDF(exam?.id || "", { id: f.id, url: f.url })} className="hover:bg-blue-50 hover:border-blue-300">
                        <Eye className="h-4 w-4" />
                        {f.isDownload === false || !canDownload ? "ดูเฉลย" : "ดูข้อสอบ"}
                      </Button>
                      {canDownload && f.isDownload !== false && (
                        <Button size="sm" onClick={() => onDownload(f.url, f.name || `${exam?.title || "exam"}.pdf`)} style={{ backgroundColor: categoryColor }}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
