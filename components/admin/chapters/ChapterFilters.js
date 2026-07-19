import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const SORT_OPTIONS = [
  { value: "order_asc", label: "ลำดับ (น้อย → มาก)" },
  { value: "order_desc", label: "ลำดับ (มาก → น้อย)" },
  { value: "title_asc", label: "ชื่อ (A → Z)" },
  { value: "title_desc", label: "ชื่อ (Z → A)" },
  { value: "created_desc", label: "สร้างล่าสุด" },
  { value: "created_asc", label: "สร้างเก่าสุด" },
];

export default function ChapterFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
}) {
  return (
    <AdminFilterBar
      searchLabel="ค้นหา Chapter"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาชื่อ Chapter..."
      selects={[
        { key: "sortBy", value: filters.sortBy, onChange: (v) => onFilterChange("sortBy", v), placeholder: "เรียงตาม", options: SORT_OPTIONS },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      activeSummary={[
        searchInput && `ค้นหา: "${searchInput}"`,
        filters.minOrder && `ลำดับต่ำสุด: ${filters.minOrder}`,
        filters.sortBy !== "order_asc" && `เรียงตาม: ${SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || filters.sortBy}`,
      ]}
    />
  );
}
