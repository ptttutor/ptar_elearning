import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderInfoGrid } from "@/features/order-success/components/order-info-grid"
import { OrderItemsList } from "@/features/order-success/components/order-items-list"
import { OrderPriceSummary } from "@/features/order-success/components/order-price-summary"
import { OrderShippingDisplay } from "@/features/order-success/components/order-shipping-display"
import { OrderActions } from "@/features/order-success/components/order-actions"
import type { EnrollmentStatus, NormalizedShipping, Order, OrderItem, SummaryRow } from "@/features/order-success/types"
import { statusBadge } from "@/features/order-success/components/status-badge"

type OrderDetailsCardProps = {
  order: Order
  paymentStatus: string
  isCompleted: boolean
  isPending: boolean
  isAuthenticated: boolean
  hasUploadedSlip: boolean
  orderDisplayId: string
  itemTypeSummary: string
  displayItems: OrderItem[]
  summaryRows: SummaryRow[]
  needsShipping: boolean
  normalizedShipping: NormalizedShipping | null
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

export function OrderDetailsCard({
  order,
  paymentStatus,
  isCompleted,
  isPending,
  isAuthenticated,
  hasUploadedSlip,
  orderDisplayId,
  itemTypeSummary,
  displayItems,
  summaryRows,
  needsShipping,
  normalizedShipping,
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
}: OrderDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : isPending ? (
              <Clock className="h-6 w-6 text-amber-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600" />
            )}
            <CardTitle className="text-lg truncate max-w-[250px] md:max-w-full">คำสั่งซื้อ #{orderDisplayId}</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">สถานะ:</span>
            {statusBadge(paymentStatus)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasUploadedSlip && !isCompleted && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            การสมัครเสร็จสมบูรณ์{" "}
            <span className="block text-xs sm:text-sm text-green-600">(ระบบกำลังตรวจสอบสลิป ภายใน 24 ชั่วโมงเพื่อเข้าเรียน)</span>
          </div>
        )}

        <OrderInfoGrid order={order} orderDisplayId={orderDisplayId} itemTypeSummary={itemTypeSummary} />
        <OrderItemsList items={displayItems} />
        <OrderPriceSummary rows={summaryRows} />
        {needsShipping && <OrderShippingDisplay order={order} normalizedShipping={normalizedShipping} />}

        <OrderActions
          order={order}
          isCompleted={isCompleted}
          isAuthenticated={isAuthenticated}
          courseItems={courseItems}
          courseTitle={courseTitle}
          canManualEnroll={canManualEnroll}
          enrollmentStatus={enrollmentStatus}
          enrollErrByCourse={enrollErrByCourse}
          onRetryEnroll={onRetryEnroll}
          ebookItems={ebookItems}
          ebookTitle={ebookTitle}
          ebookFileUrl={ebookFileUrl}
          ebookLink={ebookLink}
        />
      </CardContent>
    </Card>
  )
}
