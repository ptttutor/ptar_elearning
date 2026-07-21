import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SchoolField } from "@/components/school-field"
import { ShippingFields } from "@/components/shipping-fields"
import type { ShippingAddress } from "@/lib/schemas/shipping-address.schema"
import type { NormalizedShipping } from "@/features/order-success/types"

type UploadSlipDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  school: string | null
  schoolInput: string
  onSchoolInputChange: (value: string) => void
  normalizedShipping: NormalizedShipping | null
  shipping: ShippingAddress
  onShippingChange: (next: ShippingAddress) => void
  file: File | null
  onFileChange: (file: File | null) => void
  filePreview: string | null
  uploadMsg: string | null
  uploading: boolean
  onUpload: () => void
}

export function UploadSlipDialog({
  open,
  onOpenChange,
  school,
  schoolInput,
  onSchoolInputChange,
  normalizedShipping,
  shipping,
  onShippingChange,
  file,
  onFileChange,
  filePreview,
  uploadMsg,
  uploading,
  onUpload,
}: UploadSlipDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>อัพโหลดหลักฐานการชำระเงิน</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="border-b pb-3">
            <SchoolField school={school} schoolInput={schoolInput} onSchoolInputChange={onSchoolInputChange} />
          </div>
          {!normalizedShipping && (
            <div className="border-b pb-3">
              <ShippingFields shipping={shipping} onChange={onShippingChange} />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
          {filePreview && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">ตัวอย่างรูปที่เลือก</div>
              <div className="relative border rounded-md overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, next/image doesn't support blob: */}
                <img src={filePreview} alt="ตัวอย่างสลิป" className="max-h-72 w-full object-contain" />
              </div>
            </div>
          )}
          {uploadMsg && (
            <div aria-live="polite" className={uploadMsg.includes("สำเร็จ") || uploadMsg.includes("อนุมัติ") ? "text-green-600" : "text-destructive"}>
              {uploadMsg}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ปิด
            </Button>
            <Button disabled={!file || uploading} onClick={onUpload} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {uploading ? "กำลังอัพโหลด..." : "อัพโหลดสลิป"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
