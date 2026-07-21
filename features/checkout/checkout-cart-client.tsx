"use client"

import { Loader2, ShoppingCart, CreditCardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCheckoutCart } from "@/features/checkout/hooks/use-checkout-cart"
import { CouponInput } from "@/features/checkout/components/coupon-input"
import { SchoolField } from "@/components/school-field"
import { ShippingFields } from "@/components/shipping-fields"
import { CheckoutOrderItemRow } from "@/features/checkout/components/checkout-order-item-row"

export function CheckoutCartClient() {
  const {
    router,
    items,
    itemCount,
    syncing,
    loadingState,
    coverMap,
    subtotal,
    totalAfterDiscount,
    couponDiscount,
    anyPhysical,
    couponCode,
    updateCouponCode,
    couponError,
    couponSuccess,
    validatingCoupon,
    handleValidateCoupon,
    school,
    schoolInput,
    setSchoolInput,
    shipping,
    setShipping,
    shippingError,
    submitting,
    handleSubmit,
  } = useCheckoutCart()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingCart className="h-8 w-8 text-[#004B7D]" />
            ยืนยันคำสั่งซื้อ
          </h1>
          <p className="text-sm text-gray-500">ตรวจสอบรายละเอียดก่อนดำเนินการชำระเงิน</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/cart")}>
          ย้อนกลับไปยังตะกร้า
        </Button>
      </div>

      {loadingState ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-20 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            กำลังโหลดข้อมูลตะกร้า...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายการสินค้า ({itemCount})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item: any) => (
                <CheckoutOrderItemRow
                  key={item.id}
                  item={item}
                  coverUrl={item.coverImageUrl || coverMap[`${String(item.itemType).toUpperCase()}:${item.itemId}`] || "/placeholder.svg"}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CouponInput
                layout="stacked"
                value={couponCode}
                onChange={updateCouponCode}
                onValidate={handleValidateCoupon}
                validating={validatingCoupon}
                disabled={submitting || !items.length}
                error={couponError}
                successMessage={couponSuccess}
              />
              <Separator />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>ยอดรวม</span>
                <span>฿{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>ส่วนลดคูปอง</span>
                  <span>-฿{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>฿0</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                <span>ยอดชำระทั้งหมด</span>
                <span>฿{totalAfterDiscount.toLocaleString()}</span>
              </div>
            </CardContent>
            <Separator className="mx-6" />
            <CardContent>
              <SchoolField school={school} schoolInput={schoolInput} onSchoolInputChange={setSchoolInput} />
            </CardContent>
            {anyPhysical && (
              <>
                <Separator className="mx-6" />
                <CardContent>
                  <ShippingFields shipping={shipping} onChange={setShipping} />
                </CardContent>
              </>
            )}
            {shippingError && (
              <CardContent className="pt-0">
                <p className="text-xs text-red-500">{shippingError}</p>
              </CardContent>
            )}
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full bg-[#004B7D] hover:bg-[#00395d]" size="lg" onClick={handleSubmit} disabled={syncing || submitting}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> กำลังดำเนินการ...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ดำเนินการชำระเงิน
                    <CreditCardIcon className="h-4 w-4" />
                  </span>
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/courses")}>
                เลือกสินค้าเพิ่ม
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
