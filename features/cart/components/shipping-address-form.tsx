import type React from "react"
import { Input } from "@/components/ui/input"
import type { ShippingAddress } from "@/features/cart/types"

type ShippingAddressFormProps = {
  shipping: ShippingAddress
  onChange: (next: ShippingAddress) => void
  error: string | null
}

export function ShippingAddressForm({ shipping, onChange, error }: ShippingAddressFormProps) {
  const setField = (field: keyof ShippingAddress) => (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...shipping, [field]: event.target.value })

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">ที่อยู่จัดส่ง</h3>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-name">
          ชื่อ-นามสกุลผู้รับ
        </label>
        <Input id="shipping-name" placeholder="เช่น นายสมชาย ใจดี" value={shipping.name} onChange={setField("name")} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-phone">
          เบอร์โทรติดต่อ
        </label>
        <Input id="shipping-phone" placeholder="เช่น 0812345678" value={shipping.phone} onChange={setField("phone")} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-address">
          ที่อยู่จัดส่ง
        </label>
        <Input
          id="shipping-address"
          placeholder="เช่น 123/45 หมู่บ้านตัวอย่าง แขวงบางรัก เขตบางรัก"
          value={shipping.address}
          onChange={setField("address")}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-district">
            แขวง / ตำบล
          </label>
          <Input id="shipping-district" placeholder="เช่น สีลม" value={shipping.district} onChange={setField("district")} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-province">
            เขต / อำเภอ
          </label>
          <Input id="shipping-province" placeholder="เช่น บางรัก" value={shipping.province} onChange={setField("province")} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="shipping-postal">
            รหัสไปรษณีย์
          </label>
          <Input id="shipping-postal" placeholder="เช่น 10500" value={shipping.postalCode} onChange={setField("postalCode")} />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
