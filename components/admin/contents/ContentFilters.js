import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const CONTENT_TYPE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "VIDEO", label: "วิดีโอ" },
  { value: "PDF", label: "PDF" },
  { value: "AUDIO", label: "เสียง" },
  { value: "TEXT", label: "ข้อความ" },
  { value: "QUIZ", label: "แบบทดสอบ" },
  { value: "EXAM", label: "ข้อสอบ" },
];

const SORT_OPTIONS = [
  { value: "order_asc", label: "ลำดับ (น้อย → มาก)" },
  { value: "order_desc", label: "ลำดับ (มาก → น้อย)" },
  { value: "title_asc", label: "ชื่อ (A → Z)" },
  { value: "title_desc", label: "ชื่อ (Z → A)" },
  { value: "type_asc", label: "ประเภท (A → Z)" },
  { value: "type_desc", label: "ประเภท (Z → A)" },
  { value: "created_desc", label: "สร้างล่าสุด" },
  { value: "created_asc", label: "เก่าสุด" },
];

export default function ContentFilters({
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
      searchLabel="ค้นหาชื่อเนื้อหา"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="พิมพ์ชื่อเนื้อหาที่ต้องการค้นหา..."
      selects={[
        {
          key: "contentType",
          value: filters.contentType || "all",
          onChange: (v) => onFilterChange("contentType", v === "all" ? "" : v),
          placeholder: "ประเภทเนื้อหา",
          options: CONTENT_TYPE_OPTIONS,
        },
        { key: "sortBy", value: filters.sortBy, onChange: (v) => onFilterChange("sortBy", v), placeholder: "เรียงตาม", options: SORT_OPTIONS },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      activeSummary={[
        searchInput && `ค้นหา: "${searchInput}"`,
        filters.contentType && `ประเภท: ${CONTENT_TYPE_OPTIONS.find((o) => o.value === filters.contentType)?.label || filters.contentType}`,
        filters.sortBy !== "order_asc" && `เรียงตาม: ${SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || filters.sortBy}`,
      ]}
    />
  );
}
