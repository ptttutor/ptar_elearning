"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFlashcardDeckCheckout } from "@/features/checkout/hooks/use-flashcard-deck-checkout"
import { CouponInput } from "@/features/checkout/components/coupon-input"
import { SchoolField } from "@/components/school-field"

export function FlashcardCheckoutClient({ id }: { id: string }) {
  const {
    router,
    deck,
    loading,
    error,
    couponCode,
    setCouponCode,
    validatingCoupon,
    couponError,
    applyCoupon,
    price,
    finalTotal,
    creating,
    confirmOrder,
    school,
    schoolInput,
    setSchoolInput,
  } = useFlashcardDeckCheckout(id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">ยืนยันการสั่งซื้อชุดแฟลชการ์ด</h1>

      {loading && <div className="text-muted-foreground">กำลังโหลด...</div>}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && deck && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{deck.title}</span>
              {price === 0 ? (
                <Badge className="bg-green-600 text-white">ฟรี (฿0)</Badge>
              ) : (
                <span className="text-lg font-semibold">฿{price.toLocaleString()}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deck.description && <p className="text-sm text-muted-foreground">{deck.description}</p>}
            <SchoolField school={school} schoolInput={schoolInput} onSchoolInputChange={setSchoolInput} />
            {price > 0 && (
              <div className="space-y-2">
                <CouponInput
                  value={couponCode}
                  onChange={setCouponCode}
                  onValidate={applyCoupon}
                  validating={validatingCoupon}
                  error={couponError}
                />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">ยอดชำระ</div>
                  <div className="text-lg font-semibold text-foreground">฿{finalTotal.toLocaleString()}</div>
                </div>
              </div>
            )}
            {price === 0 && couponError && <div className="text-xs text-destructive">{couponError}</div>}
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
                ) : price === 0 ? (
                  "รับชุดนี้ฟรี"
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
