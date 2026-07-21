"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PdfViewer from "@/components/pdf/pdf-viewer"
import { useExamViewer } from "@/features/exam-viewer/hooks/use-exam-viewer"

export function ExamViewerClient({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileIdParam = searchParams?.get("fileId") ?? null
  const fileUrlParam = searchParams?.get("fileUrl") ?? null

  const { loading, error, exam, activeFile, viewLabel, resolvedFile } = useExamViewer(id, fileIdParam, fileUrlParam)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-accent pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 w-full">
              <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-1" /> กลับ
              </Button>

              <Badge variant="secondary" className="bg-primary text-primary-foreground hidden sm:inline-flex">
                {viewLabel}
              </Badge>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {viewLabel} - {exam?.title || "กำลังโหลด..."}
            </h1>
            {!!exam?.category?.name && <p className="text-muted-foreground mt-1">หมวดหมู่: {exam.category.name}</p>}
          </div>

          {loading && <div className="text-center text-muted-foreground py-10">กำลังโหลด...</div>}
          {!loading && error && <div className="text-center text-destructive py-10">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="overflow-hidden border-2 border-border">
                <CardContent className="p-0 bg-card">
                  {!activeFile ? (
                    <div className="text-center text-muted-foreground py-12">ไม่พบไฟล์สำหรับข้อสอบนี้</div>
                  ) : (
                    <div className="w-full bg-muted">
                      {resolvedFile.isPdf && resolvedFile.viewerSrc ? (
                        <div className="h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[83vh]">
                          <PdfViewer fileUrl={resolvedFile.viewerSrc} className="rounded-b-2xl bg-background" />
                        </div>
                      ) : (
                        <iframe
                          src={resolvedFile.iframeSrc ?? activeFile.url}
                          className="w-full h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[83vh]"
                          title={activeFile.name}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
