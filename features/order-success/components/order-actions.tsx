import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { EnrollmentStatus, Order, OrderItem } from "@/features/order-success/types"

type OrderActionsProps = {
  order: Order
  isCompleted: boolean
  isAuthenticated: boolean
  courseItems: OrderItem[]
  courseTitle?: string | null
  canManualEnroll: boolean
  enrollmentStatus: Record<string, EnrollmentStatus>
  enrollErrByCourse: Record<string, string | null>
  onRetryEnroll: (courseId: string, orderId: string) => void
  ebookItems: OrderItem[]
  ebookTitle?: string | null
  ebookFileUrl: string | null
  ebookLink: string | null
}

export function OrderActions({
  order,
  isCompleted,
  isAuthenticated,
  courseItems,
  courseTitle,
  canManualEnroll,
  enrollmentStatus,
  enrollErrByCourse,
  onRetryEnroll,
  ebookItems,
  ebookTitle,
  ebookFileUrl,
  ebookLink,
}: OrderActionsProps) {
  const router = useRouter()
  const showEbookActions = isCompleted && (ebookItems.length > 0 || order.ebook) && (ebookFileUrl || ebookLink)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {isCompleted && courseItems.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {courseItems.map((ci) => {
              const cid = String(ci.itemId)
              const title = ci.title || courseTitle || "คอร์สเรียน"
              const status = enrollmentStatus[cid]
              const showRetry = canManualEnroll && status === "missing"
              const err = enrollErrByCourse[cid]
              return (
                <div key={`course-actions-${cid}`} className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => router.push(`/profile/my-courses/course/${cid}`)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    aria-label={`เข้าเรียน ${title}`}
                  >
                    เข้าเรียน{courseItems.length > 1 ? ` • ${title}` : ""}
                  </Button>
                  {showRetry && (
                    <Button variant="outline" onClick={() => onRetryEnroll(cid, order.id)}>
                      ลองลงทะเบียนอีกครั้ง
                    </Button>
                  )}
                  {status === "loading" && (
                    <span className="text-xs text-muted-foreground">กำลังตรวจสอบสิทธิ์เข้าเรียน…</span>
                  )}
                  {status === "error" && <span className="text-xs text-destructive">ตรวจสอบสิทธิ์ไม่สำเร็จ</span>}
                  {typeof err === "string" && err && <span className="text-xs text-destructive">{err}</span>}
                </div>
              )
            })}
          </div>
        )}

        {showEbookActions && (
          <>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                const name = `${ebookTitle || "ebook"}.pdf`
                const url = `/api/proxy-view?url=${encodeURIComponent(ebookFileUrl || ebookLink || "")}&filename=${encodeURIComponent(name)}`
                window.open(url, "_blank")
              }}
            >
              อ่าน eBook
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const name = `${ebookTitle || "ebook"}.pdf`
                const url = `/api/proxy-download-pdf?url=${encodeURIComponent(ebookFileUrl || ebookLink || "")}&filename=${encodeURIComponent(name)}`
                window.open(url, "_blank")
              }}
            >
              ดาวน์โหลด eBook
            </Button>
          </>
        )}
      </div>

      {isCompleted && order.orderType === "COURSE" && !isAuthenticated && (
        <div className="text-sm text-amber-600">โปรดเข้าสู่ระบบเพื่อเปิดสิทธิ์เรียนอัตโนมัติ</div>
      )}
    </>
  )
}
