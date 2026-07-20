import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";
import { getSubjectOptions, getSubjectLabel } from "@/lib/constants";

const STATUS_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "active", label: "เปิดใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
];

export default function MockExamFilters({
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
  const subjectOptions = [{ value: "all", label: "ทั้งหมด" }, ...getSubjectOptions()];

  return (
    <AdminFilterBar
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาชื่อข้อสอบจำลอง..."
      selects={[
        { key: "subject", label: "วิชา", value: filters.subject, onChange: (v) => onFilterChange("subject", v), placeholder: "วิชา", options: subjectOptions },
        { key: "status", label: "สถานะ", value: filters.status, onChange: (v) => onFilterChange("status", v), placeholder: "สถานะ", options: STATUS_OPTIONS },
      ]}
      sortValue={`${filters.sortBy}-${filters.sortOrder}`}
      onSortChange={onSortSelectChange}
      sortOptions={[
        { value: "createdAt-desc", label: "วันที่สร้าง (ใหม่-เก่า)" },
        { value: "createdAt-asc", label: "วันที่สร้าง (เก่า-ใหม่)" },
        { value: "title-asc", label: "ชื่อข้อสอบ (ก-ฮ)" },
        { value: "title-desc", label: "ชื่อข้อสอบ (ฮ-ก)" },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.subject !== "all" && `วิชา: ${getSubjectLabel(filters.subject)}`,
        filters.status !== "all" && `สถานะ: ${STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}`,
      ]}
    />
  );
}
