"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSingleItemCheckout } from "@/features/checkout/hooks/use-single-item-checkout"
import { fetchCourseById } from "@/features/checkout/api/fetch-course"
import { CouponInput } from "@/features/checkout/components/coupon-input"
import { SchoolField } from "@/components/school-field"
import { ShippingFields } from "@/components/shipping-fields"

export function CourseCheckoutClient({ id }: { id: string }) {
  const {
    router,
    item: course,
    loading,
    error,
    checkingExisting,
    couponCode,
    setCouponCode,
    discount,
    validatingCoupon,
    couponError,
    applyCoupon,
    price,
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
    itemType: "COURSE",
    fetchItem: fetchCourseById,
    redirectWhenUnauthenticated: `/courses/${encodeURIComponent(id)}`,
  })

  if (checkingExisting) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">ยืนยันการสั่งซื้อคอร์ส</h1>

      {loading && <div className="text-muted-foreground">กำลังโหลด...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && course && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{course.title}</span>
              {price === 0 && <Badge className="bg-green-600 text-white">ฟรี</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {price > 0 && (
              <CouponInput
                value={couponCode}
                onChange={setCouponCode}
                onValidate={applyCoupon}
                validating={validatingCoupon}
                error={couponError}
              />
            )}
            {price > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">ยอดชำระ</div>
                <div className="text-lg font-semibold text-foreground">฿{finalTotal.toLocaleString()}</div>
              </div>
            )}

            <SchoolField school={school} schoolInput={schoolInput} onSchoolInputChange={setSchoolInput} />

            {course.isPhysical && <ShippingFields shipping={shipping} onChange={setShipping} />}
            {shippingError && <div className="text-xs text-destructive">{shippingError}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                ยกเลิก
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={confirmOrder} disabled={creating}>
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
          <div className="rounded-lg bg-background px-6 py-4 shadow-lg border">
            <div className="flex items-center gap-3 text-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>กำลังดำเนินการคำสั่งซื้อของคุณ...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
