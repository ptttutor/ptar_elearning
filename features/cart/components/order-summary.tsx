import { Loader2, CreditCardIcon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { ShippingAddress } from "@/features/cart/types"
import { ShippingAddressForm } from "@/features/cart/components/shipping-address-form"

type OrderSummaryProps = {
  couponCode: string
  onCouponCodeChange: (value: string) => void
  onValidateCoupon: () => void
  couponError: string | null
  couponSuccess: string | null
  validatingCoupon: boolean
  hasItems: boolean

  anyPhysical: boolean
  shipping: ShippingAddress
  onShippingChange: (next: ShippingAddress) => void
  shippingError: string | null

  subtotal: number
  couponDiscount: number
  totalAfterDiscount: number

  submitting: boolean
  syncing: boolean
  onCheckout: () => void
  onContinueShopping: () => void
}

export function OrderSummary({
  couponCode,
  onCouponCodeChange,
  onValidateCoupon,
  couponError,
  couponSuccess,
  validatingCoupon,
  hasItems,
  anyPhysical,
  shipping,
  onShippingChange,
  shippingError,
  subtotal,
  couponDiscount,
  totalAfterDiscount,
  submitting,
  syncing,
  onCheckout,
  onContinueShopping,
}: OrderSummaryProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="coupon">
            โค้ดส่วนลด
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="coupon"
              placeholder="กรอกรหัสคูปอง"
              value={couponCode}
              onChange={(event) => onCouponCodeChange(event.target.value)}
              disabled={validatingCoupon || submitting}
            />
            <Button
              type="button"
              variant="outline"
              className="whitespace-nowrap sm:w-auto"
              onClick={onValidateCoupon}
              disabled={validatingCoupon || !couponCode.trim() || !hasItems}
            >
              {validatingCoupon ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> ตรวจสอบ...
                </span>
              ) : (
                "ตรวจสอบคูปอง"
              )}
            </Button>
          </div>
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
          {couponSuccess && !couponError && <p className="text-xs text-green-600">{couponSuccess}</p>}
        </div>

        {anyPhysical && (
          <ShippingAddressForm shipping={shipping} onChange={onShippingChange} error={shippingError} />
        )}

        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>ยอดรวม</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>ส่วนลดคูปอง</span>
            <span>-฿{couponDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>ค่าจัดส่ง</span>
          <span>฿0</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold text-foreground">
          <span>ยอดชำระทั้งหมด</span>
          <span>฿{totalAfterDiscount.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={onCheckout} disabled={syncing || submitting}>
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> กำลังดำเนินการ...
            </span>
          ) : (
            "ไปขั้นตอนชำระเงิน"
          )}
          <CreditCardIcon />
        </Button>
        <Button variant="outline" className="w-full" onClick={onContinueShopping}>
          เลือกสินค้าเพิ่ม
        </Button>
      </CardFooter>
    </Card>
  )
}
