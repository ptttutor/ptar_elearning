export function orderStatusText(status?: string, paymentStatus?: string) {
  const s = (status || "").toUpperCase()
  const ps = (paymentStatus || "").toUpperCase()
  if (s === "CANCELLED") return "ยกเลิก"
  if (s === "REJECTED") return "ปฏิเสธ"
  // Prefer payment status when present
  if (ps === "COMPLETED") return "ชำระเงินแล้ว"
  if (ps === "PENDING_VERIFICATION") return "รอตรวจสอบสลิป"
  if (s === "COMPLETED") return "ชำระเงินแล้ว"
  if (s === "PENDING_VERIFICATION") return "รอตรวจสอบสลิป"
  if (s === "PENDING") return "รอการชำระ"
  return status || "-"
}

export function slipStatusText(paymentStatus?: string) {
  const ps = (paymentStatus || "").toUpperCase()
  if (ps === "COMPLETED") return "ชำระแล้ว"
  if (ps === "PENDING_VERIFICATION") return "รอตรวจสอบ"
  if (ps === "REJECTED") return "ปฏิเสธ"
  if (ps === "PENDING") return "รอการชำระ"
  return "ยังไม่ได้อัพโหลด/รอชำระ"
}

export function itemTypeLabel(itemType?: string) {
  const t = (itemType || "").toUpperCase()
  if (t === "COURSE") return "คอร์สเรียน"
  if (t === "EBOOK") return "E-Book"
  return "สินค้า"
}

export function statusTone(status?: string, paymentStatus?: string) {
  const s = (status || "").toUpperCase()
  const ps = (paymentStatus || "").toUpperCase()
  if (s === "CANCELLED" || s === "REJECTED") return "bg-destructive/10 text-destructive border border-destructive/20"
  if (ps === "COMPLETED") return "bg-green-50 text-green-700 border border-green-200"
  if (ps === "PENDING_VERIFICATION") return "bg-primary/10 text-primary border border-primary/20"
  if (s === "COMPLETED") return "bg-green-50 text-green-700 border border-green-200"
  if (s === "PENDING_VERIFICATION") return "bg-primary/10 text-primary border border-primary/20"
  if (s === "PENDING") return "bg-amber-50 text-amber-700 border border-amber-200"
  return "bg-muted text-muted-foreground border border-border"
}
