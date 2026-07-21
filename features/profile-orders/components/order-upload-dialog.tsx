import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Order } from "@/features/profile-orders/types"

type OrderUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOrder: Order | null
  file: File | null
  onFileChange: (file: File | null) => void
  uploading: boolean
  uploadProgress: number
  uploadError: string | null
  uploadSuccess: string | null
  onSubmit: () => void
}

export function OrderUploadDialog({
  open,
  onOpenChange,
  selectedOrder,
  file,
  onFileChange,
  uploading,
  uploadProgress,
  uploadError,
  uploadSuccess,
  onSubmit,
}: OrderUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>อัพโหลดหลักฐานการชำระเงิน</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-foreground">
            คำสั่งซื้อ: <span className="font-medium">{selectedOrder?.id}</span> ยอดชำระ:{" "}
            <span className="font-medium">฿{selectedOrder?.total.toLocaleString()}</span>
          </div>
          <Input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
          {uploadError && <div className="text-sm text-destructive">{uploadError}</div>}
          {uploadSuccess && <div className="text-sm text-green-600">{uploadSuccess}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button disabled={!file || uploading} onClick={onSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {uploading ? `กำลังอัพโหลด ${uploadProgress}%` : "อัพโหลด"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
