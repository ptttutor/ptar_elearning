import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { EbookMeta, PaidEbookEntry } from "@/features/profile-my-books/types"

const normalizeUrl = (u?: string | null): string => String(u || "").trim()

type MyBookCardProps = {
  entry: PaidEbookEntry
  meta?: EbookMeta
  fileUrl: string | null
  isResolving: boolean
  resolved: boolean
  onRetry: () => void
}

export function MyBookCard({ entry, meta, fileUrl, isResolving, resolved, onRetry }: MyBookCardProps) {
  const title = meta?.title || entry.title || "eBook"
  const cover = meta?.coverImageUrl || normalizeUrl(entry.coverImageUrl) || "/placeholder.svg"
  const filename = `${title}.pdf`

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-[2/3] relative bg-white">
          <Image src={cover} alt={title} fill className="object-contain" />
        </div>
        <div className="p-4 space-y-3">
          <div className="font-semibold text-gray-900 line-clamp-2">{title}</div>
          <div className="text-sm text-gray-600">{meta?.author || entry.author || "ไม่ระบุผู้เขียน"}</div>
          <div className="flex gap-2">
            {isResolving ? (
              <>
                <Button disabled className="bg-gray-200 text-gray-500">
                  กำลังโหลด…
                </Button>
                <Button disabled variant="outline">
                  กำลังโหลด…
                </Button>
              </>
            ) : resolved && fileUrl ? (
              <>
                <Button
                  onClick={() => {
                    const url = `/api/proxy-view?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`
                    window.open(url, "_blank")
                  }}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  อ่าน eBook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `/api/proxy-download-pdf?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`
                    window.open(url, "_blank")
                  }}
                >
                  ดาวน์โหลด
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onRetry}>
                  ลองดึงลิงก์อีกครั้ง
                </Button>
                <Button disabled className="hidden sm:inline-flex">
                  ไม่มีไฟล์ดาวน์โหลด
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
