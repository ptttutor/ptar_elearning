import { Badge } from "@/components/ui/badge"

export function ExamTypeBadge({ type }: { type?: string }) {
  const t = (type || "").toUpperCase()
  if (t === "PRETEST") return <Badge className="bg-blue-600 text-white">แบบทดสอบก่อนเรียน</Badge>
  if (t === "POSTTEST") return <Badge className="bg-green-600 text-white">แบบทดสอบหลังเรียน</Badge>
  if (t === "PRACTICE") return <Badge className="bg-purple-500 text-white">แบบฝึกหัด</Badge>
  if (t === "MIDTERM") return <Badge className="bg-sky-600 text-white">สอบกลางภาค</Badge>
  if (t === "FINAL") return <Badge className="bg-red-500 text-white">สอบปลายภาค</Badge>
  return <Badge className="bg-primary text-primary-foreground">แบบทดสอบ</Badge>
}

export function ExamStatusBadge({ status }: { status?: string | null }) {
  const value = (status || "").toUpperCase()
  if (value === "PASSED") return <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">ผ่านแล้ว</Badge>
  if (value === "FAILED") return <Badge className="bg-rose-100 text-rose-700 border border-rose-200">ไม่ผ่าน</Badge>
  if (value === "IN_PROGRESS") return <Badge className="bg-blue-100 text-blue-700 border border-blue-200">กำลังทำ</Badge>
  if (value === "NOT_STARTED") return <Badge className="bg-muted text-muted-foreground border border-border">ยังไม่ได้ทำ</Badge>
  if (value) return <Badge className="bg-muted text-muted-foreground border border-border">{value}</Badge>
  return null
}

export function getAttemptsInfo(attempts?: number | null, maxAttempts?: number | null): string | null {
  const total = typeof maxAttempts === "number" && maxAttempts > 0 ? maxAttempts : null
  const used = typeof attempts === "number" && attempts >= 0 ? attempts : null
  if (total && used !== null) return `${Math.min(used, total)}/${total}`
  if (total) return `0/${total}`
  return null
}
