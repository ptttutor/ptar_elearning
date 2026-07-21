import type React from "react"
import { Input } from "@/components/ui/input"
import type { ShippingAddress } from "@/lib/schemas/shipping-address.schema"

type ShippingFieldsProps = {
  shipping: ShippingAddress
  onChange: (next: ShippingAddress) => void
  error?: string | null
}

/**
 * Compact, unlabeled (placeholder-only) shipping fields used by the
 * checkout confirmation pages. Cart's own basket page uses the labeled
 * ShippingAddressForm instead (features/cart/components/shipping-address-form.tsx)
 * — different context (editing the basket vs. confirming an order), same
 * validation via lib/schemas/shipping-address.schema.
 */
export function ShippingFields({ shipping, onChange, error }: ShippingFieldsProps) {
  const setField = (field: keyof ShippingAddress) => (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...shipping, [field]: event.target.value })

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">ที่อยู่จัดส่ง</div>
      <div className="grid gap-2 md:grid-cols-2">
        <Input placeholder="ชื่อผู้รับ" value={shipping.name} onChange={setField("name")} />
        <Input placeholder="เบอร์โทร" value={shipping.phone} onChange={setField("phone")} />
      </div>
      <Input placeholder="ที่อยู่" value={shipping.address} onChange={setField("address")} />
      <div className="grid gap-2 sm:grid-cols-3">
        <Input placeholder="อำเภอ/เขต" value={shipping.district} onChange={setField("district")} />
        <Input placeholder="จังหวัด" value={shipping.province} onChange={setField("province")} />
        <Input placeholder="รหัสไปรษณีย์" value={shipping.postalCode} onChange={setField("postalCode")} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
