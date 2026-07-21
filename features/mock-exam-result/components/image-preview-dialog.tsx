import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function ImagePreviewDialog({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-2">
        <DialogTitle className="sr-only">รูปภาพขยาย</DialogTitle>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- external/admin-uploaded URLs, not worth Next/Image config here
          <img src={imageUrl} alt="" className="max-h-[85vh] w-full rounded-md object-contain" />
        )}
      </DialogContent>
    </Dialog>
  )
}
