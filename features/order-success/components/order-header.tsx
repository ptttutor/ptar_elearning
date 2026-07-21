import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OrderHeader({
  loading,
  error,
  onRefresh,
  onBackToOrders,
}: {
  loading: boolean
  error: string | null
  onRefresh: () => void
  onBackToOrders: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">ยืนยันการสั่งซื้อ</h1>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Button variant="outline" onClick={onBackToOrders}>
            กลับไปหน้าคำสั่งซื้อ
          </Button>
          <Button variant="outline" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" /> รีเฟรชสถานะ
          </Button>
        </div>
      </div>
      {loading && <div className="text-muted-foreground">กำลังโหลด...</div>}
      {!loading && error && <div className="text-destructive">{error}</div>}
    </div>
  )
}
