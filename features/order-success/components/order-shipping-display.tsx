import { MapPin } from "lucide-react"
import type { NormalizedShipping, Order } from "@/features/order-success/types"

export function OrderShippingDisplay({
  order,
  normalizedShipping,
}: {
  order: Order
  normalizedShipping: NormalizedShipping | null
}) {
  return (
    <div className="space-y-2 border-t pt-4 mt-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium inline-flex items-center">
          <MapPin className="h-4 w-4 mr-2" /> ที่อยู่จัดส่ง
        </div>
      </div>

      {normalizedShipping ? (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {normalizedShipping.name} • {normalizedShipping.phone}
          {"\n"}
          {normalizedShipping.address}
          {"\n"}
          {normalizedShipping.district} {normalizedShipping.province} {normalizedShipping.postalCode}
        </div>
      ) : (
        <div className="text-xs text-gray-500">ไม่ได้เพิ่มที่อยู่จัดส่ง</div>
      )}
      {order.shipping?.status && <div className="text-xs text-gray-500">สถานะจัดส่ง: {order.shipping.status}</div>}
      {order.shipping?.shippingMethod && (
        <div className="text-xs text-gray-500">ช่องทางจัดส่ง: {order.shipping.shippingMethod}</div>
      )}
    </div>
  )
}
