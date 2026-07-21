"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartCheckout } from "@/features/cart/hooks/use-cart-checkout"
import { CartItemRow } from "@/features/cart/components/cart-item-row"
import { OrderSummary } from "@/features/cart/components/order-summary"

export function CartClient() {
  const {
    router,
    items,
    loading,
    syncing,
    itemCount,
    decrease,
    remove,
    isAuthenticated,
    coverMap,
    subtotal,
    totalAfterDiscount,
    anyPhysical,
    couponCode,
    updateCouponCode,
    couponError,
    couponSuccess,
    validatingCoupon,
    handleValidateCoupon,
    shipping,
    setShipping,
    shippingError,
    couponDiscount,
    submitting,
    handleCheckout,
  } = useCartCheckout()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-primary w-9 h-9" />
            ตะกร้าสินค้า
          </h1>
          <p className="text-sm text-muted-foreground">เลือกคอร์สหรืออีบุ๊กที่คุณต้องการ ก่อนดำเนินการชำระเงิน</p>
        </div>
      </div>

      {!isAuthenticated && (
        <Card className="mb-6 border-dashed border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">เข้าสู่ระบบเพื่อใช้งานตะกร้า</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ระบบตะกร้าสินค้ารองรับเฉพาะสมาชิกที่เข้าสู่ระบบ หากยังไม่มีบัญชีสามารถสมัครได้ฟรี
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          กำลังโหลดตะกร้า...
        </div>
      ) : itemCount === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            ยังไม่มีสินค้าในตะกร้า{" "}
            <Link className="text-primary" href="/courses">
              เลือกสินค้าเลย
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                รายการสินค้า
                <span className="text-sm font-normal text-muted-foreground">ทั้งหมด {itemCount} รายการ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item: any) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  coverUrl={item.coverImageUrl || coverMap[`${String(item.itemType).toUpperCase()}:${item.itemId}`]}
                  syncing={syncing}
                  onDecrease={() => void decrease(item.id)}
                  onRemove={() => void remove({ cartItemId: item.id, itemId: item.itemId, itemType: item.itemType })}
                />
              ))}
            </CardContent>
          </Card>

          <OrderSummary
            couponCode={couponCode}
            onCouponCodeChange={updateCouponCode}
            onValidateCoupon={handleValidateCoupon}
            couponError={couponError}
            couponSuccess={couponSuccess}
            validatingCoupon={validatingCoupon}
            hasItems={items.length > 0}
            anyPhysical={anyPhysical}
            shipping={shipping}
            onShippingChange={setShipping}
            shippingError={shippingError}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            totalAfterDiscount={totalAfterDiscount}
            submitting={submitting}
            syncing={syncing}
            onCheckout={handleCheckout}
            onContinueShopping={() => router.push("/courses")}
          />
        </div>
      )}
    </div>
  )
}
