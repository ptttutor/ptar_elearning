import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { itemTypeLabel } from "@/features/profile-orders/status-labels"
import type { DisplayOrderItem } from "@/features/profile-orders/selectors"
import type { Order } from "@/features/profile-orders/types"

export function OrderItemRow({ order, item, cover }: { order: Order; item: DisplayOrderItem; cover: string }) {
  const resolvedType = String(item.itemType || order.orderType || "").toUpperCase()
  const aspectClass = resolvedType === "EBOOK" ? "aspect-[3/4]" : "aspect-video"
  const sizeClass = resolvedType === "EBOOK" ? "w-24 sm:w-32 md:w-36" : "w-28 sm:w-40 md:w-48"
  const quantity = Number(item.quantity ?? 1)
  const totalPrice = Number(item.totalPrice ?? (item.unitPrice ?? 0) * quantity)
  const unitPrice = quantity > 0 ? Number(item.unitPrice ?? totalPrice / quantity) : Number(item.unitPrice ?? 0)
  const title = item.title || (resolvedType === "COURSE" ? order.course?.title : order.ebook?.title) || itemTypeLabel(resolvedType)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:grid sm:grid-cols-[auto,1fr,auto] sm:items-center sm:gap-4 md:gap-6">
      <div className={`relative ${sizeClass} ${aspectClass} overflow-hidden rounded-md bg-muted ring-1 ring-border mx-auto sm:mx-0`}>
        <Image src={cover} alt={title} fill className="object-cover" sizes="(max-width: 480px) 30vw, (max-width: 1024px) 25vw, 12rem" />
      </div>
      <div className="min-w-0 space-y-1 sm:order-2 sm:min-w-[18rem]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-foreground line-clamp-2">{title}</div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            {itemTypeLabel(resolvedType)}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          จำนวน: {quantity} {quantity > 1 ? "ชิ้น" : "รายการ"}
        </div>
        <div className="text-xs text-muted-foreground">ราคาต่อหน่วย: {formatCurrency(unitPrice)}</div>
      </div>
      <div className="text-right text-sm font-semibold text-foreground self-end sm:order-3 sm:self-center">{formatCurrency(totalPrice)}</div>
    </div>
  )
}
