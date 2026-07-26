import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/features/order-success/types"
import { siteConfig } from "@/lib/site-config"

export function BankTransferCard({ order, onUploadClick }: { order: Order; onUploadClick: () => void }) {
  const copy = (text: string) => navigator.clipboard?.writeText(text)

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>วิธีชำระเงินโดยการโอน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-6 w-[140px]">
            <Image src="/kbank-logo.png" alt="ธนาคารกสิกรไทย" fill className="object-contain" />
          </div>
          <Badge className="bg-primary text-primary-foreground">โอนผ่าน Mobile Banking</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">เลขบัญชี</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider text-foreground">061-3-33214-6</span>
              <Button size="sm" variant="outline" onClick={() => copy("0613332146")}>
                คัดลอก
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">ชื่อบัญชี</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">ศรชัย น้อยลา</span>
              <Button size="sm" variant="outline" onClick={() => copy("ศรชัย น้อยลา")}>
                คัดลอก
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">พร้อมเพย์</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">099-632-7669</span>
              <Button size="sm" variant="outline" onClick={() => copy("0996327669")}>
                คัดลอก
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">ยอดที่ต้องชำระ</span>
            <span className="font-semibold text-foreground">฿{order.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex w-65 flex-col overflow-hidden rounded-md border bg-white">
            <div className="bg-white p-2">
              <Image src="/slip_qr/promptpay.png" alt="PromptPay" width={192} height={64} className="h-auto w-full object-contain" />
            </div>
            <div className="bg-white px-2 pb-2">
              <Image
                src="/slip_qr/QR_Pic.png"
                alt="QR Code สำหรับการโอนเงิน"
                width={192}
                height={192}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="space-y-1 bg-white px-2 pb-3 text-center text-xs text-muted-foreground">
              <div>{siteConfig.fullName}</div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground text-center">สแกน QR เพื่อโอนเงิน</span>
        </div>

        <div className="text-xs text-muted-foreground">หลังโอนแล้ว กรุณาอัพโหลดสลิป ระบบจะตรวจสอบใช้เวลาโดยประมาณ 5-10 นาที</div>
        <div className="pt-1">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full" onClick={onUploadClick}>
            อัพโหลดสลิป
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
