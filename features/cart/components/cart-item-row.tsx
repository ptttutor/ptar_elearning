import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type CartItemRowProps = {
  item: any
  coverUrl: string
  syncing: boolean
  onDecrease: () => void
  onRemove: () => void
}

export function CartItemRow({ item, coverUrl, syncing, onDecrease, onRemove }: CartItemRowProps) {
  const isCourse = String(item.itemType).toUpperCase() === "COURSE"

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center">
      <div className="flex flex-1 items-start gap-4">
        <div
          className={`relative w-full max-w-[128px] overflow-hidden rounded-md bg-muted ring-1 ring-border ${
            isCourse ? "aspect-video" : "aspect-[3/4]"
          }`}
        >
          <Image src={coverUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" sizes="128px" />
        </div>
        <div className="flex-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{item.itemType}</p>
          <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">ราคา: ฿{(item.unitPrice || 0).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-4 md:w-auto">
        <div className="flex items-center rounded-full border border-border bg-background">
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full"
            disabled={syncing || (item.quantity || 1) <= 1}
            onClick={onDecrease}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{item.quantity ?? 1}</span>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full"
            disabled
            title="จำกัดจำนวนสูงสุด 1 รายการต่อบุคคล"
            aria-label={`เพิ่มจำนวน ${item.title} สูงสุด 1 รายการต่อบุคคล`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-w-[90px] text-right text-base font-semibold text-foreground">
          ฿{((item.unitPrice || 0) * (item.quantity || 1) || 0).toLocaleString()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={syncing}
          aria-label={`ลบ ${item.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
