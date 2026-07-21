import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { statusBadge } from "@/features/order-success/components/status-badge"
import type { Order } from "@/features/order-success/types"

type SlipInfo = {
  slipOKSuccess: any
  detectedAmount: any
  detectedDate: any
  summary: { passed?: number; warnings?: number; failed?: number } | null
} | null

export function SlipStatusCard({ order, paymentStatus, slipInfo }: { order: Order; paymentStatus: string; slipInfo: SlipInfo }) {
  const slipUrl = order.payment?.slipUrl

  return (
    <Card>
      <CardHeader>
        <CardTitle>สถานะการตรวจสลิป</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground">สถานะคำสั่งซื้อ:</div>
          {statusBadge(paymentStatus)}
        </div>

        {slipUrl && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-24 w-40 overflow-hidden rounded border">
              <Image src={slipUrl} alt="สลิปโอนเงิน" fill className="object-cover" />
            </div>
            <a href={slipUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
              เปิดสลิปต้นฉบับ
            </a>
          </div>
        )}

        {slipInfo && (
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              ผลตรวจ SlipOK: <span className="font-medium">{slipInfo.slipOKSuccess ? "สำเร็จ" : "ไม่สำเร็จ"}</span>
            </div>
            {typeof slipInfo.detectedAmount !== "undefined" && slipInfo.detectedAmount !== null && (
              <div>
                จำนวนเงินที่ตรวจพบ: <span className="font-medium">฿{Number(slipInfo.detectedAmount).toLocaleString()}</span>
              </div>
            )}
            {slipInfo.detectedDate && (
              <div>
                วันที่โอนที่ตรวจพบ: <span className="font-medium">{String(slipInfo.detectedDate)}</span>
              </div>
            )}
            {slipInfo.summary && (
              <div className="sm:col-span-2 text-muted-foreground">
                สรุปการตรวจสอบ: ผ่าน {slipInfo.summary.passed || 0} • เตือน {slipInfo.summary.warnings || 0} • ไม่ผ่าน{" "}
                {slipInfo.summary.failed || 0}
              </div>
            )}
          </div>
        )}

        {!slipUrl && <div className="text-sm text-muted-foreground">ยังไม่มีสลิปกรอกเข้ามา กรุณาอัพโหลดหลักฐานการชำระเงิน</div>}
      </CardContent>
    </Card>
  )
}
