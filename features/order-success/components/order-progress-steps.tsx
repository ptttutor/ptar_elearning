import { CheckCircle2 } from "lucide-react"
import { isPaidLikeStatus } from "@/features/order-success/selectors"
import type { Order } from "@/features/order-success/types"

export function OrderProgressSteps({ order, hasUploadedSlip }: { order: Order; hasUploadedSlip: boolean }) {
  const s = (order?.status || "").toUpperCase()
  const ps = (order?.payment?.status || "").toUpperCase()
  const step2Done = hasUploadedSlip || isPaidLikeStatus(s) || isPaidLikeStatus(ps)
  const step2Active = ["PENDING", "PENDING_VERIFICATION"].includes(s) || step2Done
  const step3Done = hasUploadedSlip || isPaidLikeStatus(s) || isPaidLikeStatus(ps)
  const step2Label = !step2Done && (s === "PENDING_VERIFICATION" || ps === "PENDING_VERIFICATION") ? "ตรวจสอบ" : "ชำระเงิน"

  return (
    <div className="bg-background/60 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-max">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-primary">สั่งซื้อ</span>
        </div>
        <div className={`h-0.5 flex-1 ${step2Active ? "bg-primary" : "bg-muted"}`} />
        <div className="flex items-center gap-2 min-w-max">
          {step2Done ? (
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          ) : (
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-primary text-primary">2</span>
          )}
          <span className={`text-sm font-medium ${step2Active ? "text-primary" : "text-muted-foreground"}`}>{step2Label}</span>
        </div>
        <div className={`h-0.5 flex-1 ${step3Done ? "bg-primary" : "bg-muted"}`} />
        <div className="flex items-center gap-2 min-w-max">
          {step3Done ? (
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-600 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          ) : (
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted text-muted-foreground">3</span>
          )}
          <span className={`text-sm font-medium ${step3Done ? "text-green-700" : "text-muted-foreground"}`}>สำเร็จ</span>
        </div>
      </div>
    </div>
  )
}
