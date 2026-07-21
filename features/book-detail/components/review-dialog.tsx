import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/features/book-detail/components/star-rating"

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>เขียนรีวิว</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">ให้คะแนน</div>
            <StarRating value={rating} onChange={onRatingChange} />
          </div>
          <div>
            <Input placeholder="หัวข้อรีวิว" value={title} onChange={(e) => onTitleChange(e.target.value)} />
          </div>
          <div>
            <Textarea placeholder="ความคิดเห็นของคุณ" value={comment} onChange={(e) => onCommentChange(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button onClick={onSubmit} disabled={posting}>
              {posting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> กำลังส่ง...
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
