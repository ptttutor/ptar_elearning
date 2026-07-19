"use client";
import { FileText, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CouponInfoCard({ selectedOrder, formatPrice }) {
  if (!selectedOrder.coupon) return null;

  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <FileText className="h-4 w-4 text-blue-600" />
        ข้อมูลคูปองส่วนลด
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="h-3.5 w-3.5" /> รหัสคูปอง
          </div>
          <Badge variant="outline" className="font-mono">{selectedOrder.couponCode}</Badge>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="h-3.5 w-3.5" /> ชื่อคูปอง
          </div>
          <div className="text-sm text-gray-700">{selectedOrder.coupon.name}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> ส่วนลด
          </div>
          <div className="text-sm text-emerald-600">
            {selectedOrder.coupon.type === "PERCENTAGE" ? `${selectedOrder.coupon.value}%` : formatPrice(selectedOrder.coupon.value)}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> จำนวนเงินที่ลด
          </div>
          <div className="text-sm text-emerald-600">-{formatPrice(selectedOrder.couponDiscount)}</div>
        </div>
      </div>
    </div>
  );
}
