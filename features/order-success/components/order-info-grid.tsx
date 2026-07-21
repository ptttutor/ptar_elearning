import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, toPaymentMethodLabel } from "@/features/order-success/selectors"
import type { Order } from "@/features/order-success/types"

export function OrderInfoGrid({ order, orderDisplayId, itemTypeSummary }: { order: Order; orderDisplayId: string; itemTypeSummary: string }) {
  const copy = (text: string) => navigator.clipboard?.writeText(text)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <div className="text-sm text-gray-600">ประเภทสินค้า</div>
        <div className="font-medium text-gray-900">{itemTypeSummary}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-gray-600">ยอดรวม</div>
        <div className="font-semibold text-gray-900">{formatCurrency(order.total)}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-gray-600">วันที่สั่งซื้อ</div>
        <div className="text-gray-900">{new Date(order.createdAt).toLocaleString("th-TH")}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-gray-600">หมายเลขคำสั่งซื้อ</div>
        <div className="text-gray-900 inline-flex flex-wrap items-center gap-2">
          <span className="font-medium">#{orderDisplayId}</span>
          <Button size="sm" variant="outline" onClick={() => copy(String(orderDisplayId))}>
            คัดลอก
          </Button>
        </div>
        {order.orderNumber && order.orderNumber !== order.id && (
          <div className="text-xs text-gray-500 break-all">รหัสอ้างอิงระบบ: {order.id}</div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">ช่องทางชำระเงิน</div>
        <div className="text-foreground">{toPaymentMethodLabel(order.payment?.method)}</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">ยอดที่ชำระ</div>
        <div className="text-foreground">{formatCurrency(order.payment?.amount ?? order.total)}</div>
        {order.payment?.paidAt && (
          <div className="text-xs text-muted-foreground">ชำระเมื่อ: {new Date(order.payment.paidAt).toLocaleString("th-TH")}</div>
        )}
      </div>
      {order.payment?.ref && (
        <div className="space-y-1 sm:col-span-2">
          <div className="text-sm text-muted-foreground">เลขอ้างอิงการชำระ</div>
          <div className="inline-flex flex-wrap items-center gap-2 text-foreground">
            <span className="font-medium break-all">{order.payment.ref}</span>
            <Button size="sm" variant="outline" onClick={() => copy(String(order.payment!.ref))}>
              คัดลอก
            </Button>
          </div>
        </div>
      )}
      {order.couponCode && (
        <div className="space-y-1 sm:col-span-2">
          <div className="text-sm text-muted-foreground">คูปองที่ใช้</div>
          <div className="inline-flex flex-wrap items-center gap-2">
            <Badge className="border border-amber-200 bg-amber-100 text-amber-700">{order.couponCode}</Badge>
            {Number(order.couponDiscount) > 0 && (
              <span className="text-xs text-muted-foreground">ลด {formatCurrency(order.couponDiscount)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
