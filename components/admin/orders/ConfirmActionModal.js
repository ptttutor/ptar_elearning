"use client";
import { Check, X, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmActionModal({ visible, actionType, selectedOrder, loading = false, onOk, onCancel }) {
  const isConfirm = actionType === "confirm";

  return (
    <AlertDialog open={visible} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isConfirm ? "text-emerald-600" : "text-red-600"}`}>
            {isConfirm ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            {isConfirm ? "ยืนยันการชำระเงิน" : "ปฏิเสธการชำระเงิน"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-700">
            {isConfirm
              ? `ต้องการยืนยันการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id ? selectedOrder.id.slice(-8) : "N/A"} หรือไม่?`
              : `ต้องการปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ #${selectedOrder?.id ? selectedOrder.id.slice(-8) : "N/A"} หรือไม่?`}
          </p>

          <div className="rounded-md bg-gray-50 p-3">
            {isConfirm ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <Check className="h-4 w-4" />
                ลูกค้าจะสามารถเข้าถึงเนื้อหาได้ทันที
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <X className="h-4 w-4" />
                คำสั่งซื้อจะถูกยกเลิกและลูกค้าจะได้รับแจ้งเตือน
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
          <Button
            className={isConfirm ? "bg-emerald-600 hover:bg-emerald-700" : undefined}
            variant={isConfirm ? "default" : "destructive"}
            onClick={onOk}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isConfirm ? "ยืนยัน" : "ปฏิเสธ"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
