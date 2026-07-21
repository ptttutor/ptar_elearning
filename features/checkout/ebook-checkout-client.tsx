"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSingleItemCheckout } from "@/features/checkout/hooks/use-single-item-checkout"
import { fetchEbookById } from "@/features/checkout/api/fetch-ebook"
import { CouponInput } from "@/features/checkout/components/coupon-input"
import { SchoolField } from "@/features/checkout/components/school-field"
import { ShippingFields } from "@/features/checkout/components/shipping-fields"

export function EbookCheckoutClient({ id }: { id: string }) {
  const {
    router,
    item: ebook,
    loading,
    error,
    checkingExisting,
    couponCode,
    setCouponCode,
    discount,
    validatingCoupon,
    couponError,
    applyCoupon,
    finalTotal,
    school,
    schoolInput,
    setSchoolInput,
    shipping,
    setShipping,
    shippingError,
    creating,
    confirmOrder,
  } = useSingleItemCheckout({
    id,
    itemType: "EBOOK",
    fetchItem: fetchEbookById,
    redirectWhenUnauthenticated: "/",
  })

  if (checkingExisting) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ยืนยันการสั่งซื้อหนังสือ</h1>

      {loading && <div className="text-gray-600">กำลังโหลด...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && ebook && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{ebook.title}</span>
              <Badge className="bg-amber-500 text-white">E-Book</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CouponInput
              value={couponCode}
              onChange={setCouponCode}
              onValidate={applyCoupon}
              validating={validatingCoupon}
              error={couponError}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">ยอดชำระ</div>
              <div className="text-lg font-semibold">฿{finalTotal.toLocaleString()}</div>
            </div>

            <SchoolField school={school} schoolInput={schoolInput} onSchoolInputChange={setSchoolInput} />

            {ebook.isPhysical && <ShippingFields shipping={shipping} onChange={setShipping} />}
            {shippingError && <div className="text-xs text-red-600">{shippingError}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                ยกเลิก
              </Button>
              <Button className="bg-blue-400 hover:bg-blue-500 text-white" onClick={confirmOrder} disabled={creating}>
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังสร้างคำสั่งซื้อ...
                  </span>
                ) : (
                  "ยืนยันการสั่งซื้อ"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3 text-gray-800">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span>กำลังดำเนินการคำสั่งซื้อของคุณ...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
