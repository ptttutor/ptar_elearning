import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/features/course-detail/components/star-rating"

type ReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rating: number
  onRatingChange: (v: number) => void
  title: string
  onTitleChange: (v: string) => void
  comment: string
  onCommentChange: (v: string) => void
  posting: boolean
  onSubmit: () => void
}

export function ReviewDialog({ open, onOpenChange, rating, onRatingChange, title, onTitleChange, comment, onCommentChange, posting, onSubmit }: ReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เขียนรีวิวคอร์สนี้</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-card-foreground mb-1">ให้คะแนน</div>
            <StarRating value={rating} onChange={onRatingChange} />
          </div>
          <div>
            <div className="text-sm text-card-foreground mb-1">หัวข้อรีวิว</div>
            <Input placeholder="เช่น เยี่ยมมาก! ได้ความรู้ครบถ้วน" value={title} onChange={(e) => onTitleChange(e.target.value)} className="h-10" />
          </div>
          <div>
            <div className="text-sm text-card-foreground mb-1">รายละเอียด</div>
            <Textarea rows={4} placeholder="แชร์ประสบการณ์ของคุณเกี่ยวกับคอร์สนี้..." value={comment} onChange={(e) => onCommentChange(e.target.value)} className="min-h-[120px]" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={posting || !title.trim() || !comment.trim()} onClick={onSubmit}>
              {posting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                "ส่งรีวิว"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
