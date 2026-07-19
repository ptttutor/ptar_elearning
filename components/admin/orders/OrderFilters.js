"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอชำระ" },
  { value: "PENDING_VERIFICATION", label: "รอตรวจสอบ" },
  { value: "COMPLETED", label: "ชำระแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

const ORDER_TYPE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "COURSE", label: "คอร์สเรียน" },
  { value: "EBOOK", label: "หนังสือ" },
];

export default function OrderFilters({ filters, onFilterChange, onDateChange, onResetFilters, loading, totalCount, currentCount }) {
  return (
    <AdminFilterBar
      searchLabel="ค้นหา"
      searchValue={filters.search}
      onSearchChange={(v) => onFilterChange("search", v)}
      searchPlaceholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า"
      selects={[
        {
          key: "paymentStatus",
          value: filters.paymentStatus || "all",
          onChange: (v) => onFilterChange("paymentStatus", v === "all" ? "" : v),
          label: "สถานะการชำระเงิน",
          placeholder: "สถานะการชำระเงิน",
          options: PAYMENT_STATUS_OPTIONS,
        },
        {
          key: "orderType",
          value: filters.orderType || "all",
          onChange: (v) => onFilterChange("orderType", v === "all" ? "" : v),
          label: "ประเภทสินค้า",
          placeholder: "ประเภทสินค้า",
          options: ORDER_TYPE_OPTIONS,
        },
      ]}
      extraFields={[
        {
          key: "dateRange",
          label: "ช่วงวันที่",
          render: () => (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-normal text-gray-500">จากวันที่</Label>
                <Input type="date" value={filters.dateFrom} onChange={(e) => onDateChange(e.target.value, filters.dateTo)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-normal text-gray-500">ถึงวันที่</Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => onDateChange(filters.dateFrom, e.target.value)} />
              </div>
            </div>
          ),
        },
      ]}
      onReset={onResetFilters}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.paymentStatus && `สถานะ: ${PAYMENT_STATUS_OPTIONS.find((o) => o.value === filters.paymentStatus)?.label}`,
        filters.orderType && `ประเภท: ${ORDER_TYPE_OPTIONS.find((o) => o.value === filters.orderType)?.label}`,
        (filters.dateFrom || filters.dateTo) && `วันที่: ${filters.dateFrom || "..."} - ${filters.dateTo || "..."}`,
      ]}
    />
  );
}
