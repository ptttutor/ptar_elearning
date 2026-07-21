import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { orderStatusText, slipStatusText, statusTone } from "@/features/profile-orders/status-labels"
import { getDisplayItems, getOrderStatusFlags } from "@/features/profile-orders/selectors"
import { OrderItemRow } from "@/features/profile-orders/components/order-item-row"
import type { Order } from "@/features/profile-orders/types"

export function OrderCard({ order, itemAssets, onUploadSlip }: { order: Order; itemAssets: Record<string, string>; onUploadSlip: (order: Order) => void }) {
  const statusLabel = orderStatusText(order.status, order.payment?.status)
  const { needsSlipUpload, isPaid } = getOrderStatusFlags(order)
  const displayId = order.orderNumber || order.id
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }) : ""
  const items = getDisplayItems(order)

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-foreground">คำสั่งซื้อ #{displayId}</div>
              <Badge className={`whitespace-nowrap ${statusTone(order.status, order.payment?.status)}`}>{statusLabel}</Badge>
            </div>
            {createdAt && <div className="text-xs text-muted-foreground">สั่งซื้อเมื่อ {createdAt}</div>}
            <div className="text-sm text-foreground">ยอดรวม {formatCurrency(order.total)} บาท</div>
            <div className="text-xs text-muted-foreground">สถานะตรวจสลิป: {slipStatusText(order.payment?.status)}</div>
            {order.payment?.ref && <div className="text-xs text-muted-foreground">เลขอ้างอิง: {order.payment.ref}</div>}
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
            <Link href={`/order-success/${order.id}`} className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-[7.5rem]">
                ดูรายละเอียด
              </Button>
            </Link>

            {needsSlipUpload ? (
              <Button onClick={() => onUploadSlip(order)} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-[7.5rem]">
                อัพโหลดสลิป
              </Button>
            ) : isPaid ? (
              <Badge className="bg-green-600 text-white w-full md:w-auto justify-center">ชำระเงินแล้ว</Badge>
            ) : (
              <Badge className={`${statusTone(order.status, order.payment?.status)} w-full md:w-auto justify-center`}>{statusLabel}</Badge>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border pt-3">
            {items.map((item) => {
              const resolvedType = String(item.itemType || order.orderType || "").toUpperCase()
              const itemId = item.itemId || (resolvedType === "COURSE" ? order.courseId : order.ebookId) || ""
              const assetKey = `${resolvedType}:${itemId}`
              const cover =
                (itemId && itemAssets[assetKey]) ||
                (resolvedType === "COURSE" ? order.course?.coverImageUrl : order.ebook?.coverImageUrl) ||
                "/placeholder.svg"
              return <OrderItemRow key={item._key} order={order} item={item} cover={cover} />
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
