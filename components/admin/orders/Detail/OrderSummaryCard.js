"use client";
import { Calculator, DollarSign } from "lucide-react";

export default function OrderSummaryCard({ selectedOrder, formatPrice }) {
  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Calculator className="h-4 w-4 text-blue-600" />
        สรุปยอดสั่งซื้อ
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> ราคาสินค้า
          </div>
          <div className="text-sm text-gray-700">{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> ค่าจัดส่ง
          </div>
          <div className="text-sm text-gray-700">{formatPrice(selectedOrder.shippingFee || 0)}</div>
        </div>
        {selectedOrder.couponDiscount > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <DollarSign className="h-3.5 w-3.5" /> ส่วนลด
            </div>
            <div className="text-sm text-emerald-600">-{formatPrice(selectedOrder.couponDiscount)}</div>
          </div>
        )}
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> ยอดรวมทั้งสิ้น
          </div>
          <div className="text-lg font-bold text-emerald-600">{formatPrice(selectedOrder.total)}</div>
        </div>
      </div>
    </div>
  );
}
