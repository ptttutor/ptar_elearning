import { Badge } from "@/components/ui/badge"
import { isPaidLikeStatus } from "@/features/order-success/selectors"

export function statusBadge(status?: string) {
  const s = (status || "").toUpperCase()
  if (isPaidLikeStatus(s)) return <Badge className="bg-green-600 text-white">ชำระเงินแล้ว</Badge>
  if (s === "PENDING_VERIFICATION") return <Badge className="bg-blue-500 text-white">รอตรวจสอบสลิป</Badge>
  if (s === "PENDING") return <Badge className="bg-blue-400 text-white">รอการชำระ</Badge>
  if (s === "REJECTED" || s === "CANCELLED") return <Badge className="bg-red-600 text-white">ปฏิเสธ/ยกเลิก</Badge>
  return <Badge variant="secondary">{status}</Badge>
}
