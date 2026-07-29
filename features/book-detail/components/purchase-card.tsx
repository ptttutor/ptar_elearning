import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const fmtMoney = (n?: number | null) => (typeof n === "number" ? `฿${n.toLocaleString()}` : "-")

type PurchaseCardProps = {
  price: number
  discountPrice?: number | null
  hasDiscount: boolean
  couponCode: string
  onCouponCodeChange: (value: string) => void
  creating: boolean
  onCheckout: () => void
  inCart: boolean
  addingToCart: boolean
  cartSyncing: boolean
  onAddToCart: () => void
}

export function PurchaseCard({ price, discountPrice, hasDiscount, couponCode, onCouponCodeChange, creating, onCheckout, inCart, addingToCart, cartSyncing, onAddToCart }: PurchaseCardProps) {
  return (
    <aside className="order-2 lg:order-2 lg:col-span-1">
      <Card className="rounded-2xl shadow-lg ring-1 ring-black/5">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            {hasDiscount ? (
              <div className="flex items-end justify-center gap-3">
                <span className="text-xl text-gray-400 line-through">{fmtMoney(price)}</span>
                <span className="text-3xl font-extrabold text-primary tracking-tight">{fmtMoney(discountPrice)}</span>
              </div>
            ) : (
              <span className="text-3xl font-extrabold text-primary tracking-tight">{fmtMoney(price)}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">ราคารวมภาษีมูลค่าเพิ่ม</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">คูปองส่วนลด</div>
            <div className="flex gap-2">
              <Input placeholder="กรอกรหัสคูปอง (ถ้ามี)" value={couponCode} onChange={(e) => onCouponCodeChange(e.target.value)} className="h-10 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={onCheckout} disabled={creating} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 rounded-xl shadow hover:shadow-md transition">
              {creating ? "กำลังไปหน้าชำระเงิน..." : "ไปหน้าชำระเงิน"}
            </Button>
            <Button variant="outline" className="w-full rounded-xl" disabled={creating || addingToCart || cartSyncing || inCart} onClick={onAddToCart}>
              {inCart ? "อยู่ในตะกร้าแล้ว" : addingToCart || cartSyncing ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
            </Button>
          </div>

          <Separator />
        </CardContent>
      </Card>
    </aside>
  )
}
