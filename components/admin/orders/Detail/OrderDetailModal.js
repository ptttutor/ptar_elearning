"use client";
import { Eye, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomerInfoCard from "./CustomerInfoCard";
import ProductInfoCard from "./ProductInfoCard";
import CourseInfoCard from "./CourseInfoCard";
import PaymentInfoCard from "./PaymentInfoCard";
import CouponInfoCard from "./CouponInfoCard";
import OrderSummaryCard from "./OrderSummaryCard";
import ShippingInfoCard from "./ShippingInfoCard";

export default function OrderDetailModal({
  visible,
  loading,
  selectedOrder,
  onCancel,
  onConfirmPayment,
  onRejectPayment,
  formatPrice,
  formatDate,
  getPaymentStatusColor,
  getPaymentStatusText,
}) {
  return (
    <Dialog open={visible} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            รายละเอียดคำสั่งซื้อ #{selectedOrder?.id?.slice(-8) || "..."}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : selectedOrder ? (
          <div>
            <CustomerInfoCard selectedOrder={selectedOrder} />
            <ProductInfoCard selectedOrder={selectedOrder} formatPrice={formatPrice} />
            {selectedOrder.orderType === "COURSE" && selectedOrder.course && (
              <CourseInfoCard selectedOrder={selectedOrder} formatPrice={formatPrice} />
            )}
            <PaymentInfoCard
              selectedOrder={selectedOrder}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getPaymentStatusColor={getPaymentStatusColor}
              getPaymentStatusText={getPaymentStatusText}
            />
            <CouponInfoCard selectedOrder={selectedOrder} formatPrice={formatPrice} />
            <OrderSummaryCard selectedOrder={selectedOrder} formatPrice={formatPrice} />
            <ShippingInfoCard selectedOrder={selectedOrder} />
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-gray-400">ไม่สามารถโหลดข้อมูลได้</div>
        )}

        <DialogFooter>
          {selectedOrder?.payment?.status === "PENDING_VERIFICATION" ? (
            <>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  onCancel();
                  onConfirmPayment(selectedOrder);
                }}
              >
                <Check className="mr-1.5 h-4 w-4" /> ยืนยันการชำระเงิน
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onCancel();
                  onRejectPayment(selectedOrder);
                }}
              >
                <X className="mr-1.5 h-4 w-4" /> ปฏิเสธการชำระเงิน
              </Button>
              <Button variant="outline" onClick={onCancel}>
                ปิด
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onCancel}>
              ปิด
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
