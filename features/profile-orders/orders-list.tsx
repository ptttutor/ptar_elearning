"use client"

import { useAuth } from "@/components/auth-provider"
import { useOrders } from "@/features/profile-orders/hooks/use-orders"
import { useOrderItemCovers } from "@/features/profile-orders/hooks/use-order-item-covers"
import { useOrderUploadDialog } from "@/features/profile-orders/hooks/use-order-upload-dialog"
import { OrderListSkeleton } from "@/features/profile-orders/components/order-list-skeleton"
import { OrderCard } from "@/features/profile-orders/components/order-card"
import { OrderUploadDialog } from "@/features/profile-orders/components/order-upload-dialog"

export function OrdersList() {
  const { user } = useAuth()
  const { orders, loading, error, refetch } = useOrders(user?.id)
  const itemAssets = useOrderItemCovers(orders)
  const uploadDialog = useOrderUploadDialog(refetch)

  return (
    <div>
      {loading && <OrderListSkeleton />}

      {!loading && error && <div className="text-destructive">เกิดข้อผิดพลาด: {error}</div>}

      {!loading && !error && orders.length === 0 && <div className="text-muted-foreground">ยังไม่มีคำสั่งซื้อ</div>}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} itemAssets={itemAssets} onUploadSlip={uploadDialog.openFor} />
          ))}
        </div>
      )}

      <OrderUploadDialog
        open={uploadDialog.open}
        onOpenChange={uploadDialog.setOpen}
        selectedOrder={uploadDialog.selectedOrder}
        file={uploadDialog.file}
        onFileChange={uploadDialog.setFile}
        uploading={uploadDialog.uploading}
        uploadProgress={uploadDialog.uploadProgress}
        uploadError={uploadDialog.uploadError}
        uploadSuccess={uploadDialog.uploadSuccess}
        onSubmit={uploadDialog.submit}
      />
    </div>
  )
}
