import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EnrolledDialog({
  open,
  onOpenChange,
  courseId,
  onWriteReview,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onWriteReview: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>คุณได้ซื้อคอร์สนี้แล้ว</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-muted-foreground">เริ่มเรียนต่อได้ทันทีที่หน้าเรียน</div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
            <Link href={`/profile/my-courses/course/${courseId}/`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">เข้าเรียน</Button>
            </Link>
            <Button variant="outline" onClick={onWriteReview}>
              เขียนรีวิวคอร์สนี้
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
