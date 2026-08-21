import Link from "next/link"
import { Button } from "@/components/ui/button"

export function StudySummary({ reviewedCount }: { reviewedCount: number }) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <p className="text-2xl font-bold mb-1">จบรอบแล้ว 🎉</p>
      <p className="text-sm text-muted-foreground">ทบทวนไป {reviewedCount} ใบ — แล้วเจอกันใหม่ตามกำหนดของแต่ละใบ</p>
      <Link href="/flashcards">
        <Button className="mt-6">กลับไปรายการชุด</Button>
      </Link>
    </div>
  )
}
