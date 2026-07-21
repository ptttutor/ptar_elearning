import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MyCoursesEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">📚</div>
      <div className="text-lg font-medium text-foreground mb-2">ยังไม่มีคอร์สที่ซื้อ</div>
      <div className="text-muted-foreground mb-4">เริ่มเรียนรู้ได้เลย เลือกคอร์สที่สนใจ</div>
      <Link href="/courses">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">ดูคอร์สทั้งหมด</Button>
      </Link>
    </div>
  )
}
