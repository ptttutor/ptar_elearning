"use client";
import { Input } from "@/components/ui/input";
import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const STATUS_OPTIONS = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "PROCESSING", label: "กำลังเตรียม" },
  { value: "SHIPPED", label: "จัดส่งแล้ว" },
  { value: "DELIVERED", label: "ส่งถึงแล้ว" },
  { value: "CANCELLED", label: "ยกเลิก" },
];

const METHOD_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "KERRY", label: "Kerry Express" },
  { value: "THAILAND_POST", label: "ไปรษณีย์ไทย" },
  { value: "JT_EXPRESS", label: "J&T Express" },
  { value: "FLASH_EXPRESS", label: "Flash Express" },
  { value: "NINJA_VAN", label: "Ninja Van" },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "วันที่สร้าง (ใหม่ล่าสุด)" },
  { value: "createdAt_asc", label: "วันที่สร้าง (เก่าสุด)" },
  { value: "shippedAt_desc", label: "วันที่จัดส่ง (ใหม่ล่าสุด)" },
  { value: "shippedAt_asc", label: "วันที่จัดส่ง (เก่าสุด)" },
  { value: "recipientName_asc", label: "ชื่อผู้รับ (A-Z)" },
  { value: "recipientName_desc", label: "ชื่อผู้รับ (Z-A)" },
];

export default function ShippingFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onSortSelectChange,
  onReset,
  totalCount,
  currentCount,
  loading,
}) {
  return (
    <AdminFilterBar
      searchLabel="ค้นหา"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหารหัสคำสั่งซื้อ, ชื่อผู้รับ, เบอร์โทร"
      selects={[
        { key: "status", value: filters.status, onChange: (v) => onFilterChange("status", v), label: "สถานะ", placeholder: "เลือกสถานะ", options: STATUS_OPTIONS },
        { key: "shippingMethod", value: filters.shippingMethod, onChange: (v) => onFilterChange("shippingMethod", v), label: "บริษัทขนส่ง", placeholder: "เลือกบริษัท", options: METHOD_OPTIONS },
      ]}
      extraFields={[
        {
          key: "dateRange",
          label: "ช่วงวันที่",
          render: () => (
            <div className="flex items-center gap-2">
              <Input type="date" value={filters.startDate} onChange={(e) => onFilterChange("startDate", e.target.value)} className="flex-1" />
              <span className="shrink-0 text-sm text-gray-400">ถึง</span>
              <Input type="date" value={filters.endDate} onChange={(e) => onFilterChange("endDate", e.target.value)} className="flex-1" />
            </div>
          ),
        },
      ]}
      sortLabel="เรียงตาม"
      sortValue={`${filters.sortBy}_${filters.sortOrder}`}
      onSortChange={onSortSelectChange}
      sortOptions={SORT_OPTIONS}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        searchInput && `ค้นหา: "${searchInput}"`,
        filters.status !== "ALL" && `สถานะ: ${STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}`,
        filters.shippingMethod !== "all" && `บริษัทขนส่ง: ${METHOD_OPTIONS.find((o) => o.value === filters.shippingMethod)?.label}`,
        (filters.startDate || filters.endDate) && `วันที่: ${filters.startDate || "..."} - ${filters.endDate || "..."}`,
      ]}
    />
  );
}
