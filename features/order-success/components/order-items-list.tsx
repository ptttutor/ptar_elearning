import { formatCurrency, toItemTypeLabel } from "@/features/order-success/selectors"
import type { OrderItem } from "@/features/order-success/types"

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-card-foreground">รายการสินค้า</div>
      <div className="divide-y rounded-lg border bg-muted/30">
        {items.map((item) => {
          const qty = Number(item.quantity || 1)
          const unit = Number(item.unitPrice ?? item.totalPrice ?? 0)
          const total = Number(item.totalPrice ?? unit * qty)
          const key = item.id || `${item.itemType}-${item.itemId}`
          return (
            <div key={key} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium text-foreground">{item.title || toItemTypeLabel(item.itemType)}</div>
                <div className="text-xs text-muted-foreground">ประเภท: {toItemTypeLabel(item.itemType)}</div>
                <div className="text-xs text-muted-foreground">จำนวน: {qty}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold text-foreground">{formatCurrency(total)}</div>
                {qty > 1 && <div className="text-xs text-gray-500">({formatCurrency(unit)} / ชิ้น)</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
