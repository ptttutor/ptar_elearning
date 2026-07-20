import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";
import { getSubjectOptions, getSubjectLabel } from "@/lib/constants";

export default function MockTopicFilters({
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
      searchPlaceholder="ค้นหาชื่อหัวข้อ..."
      selects={[
        { key: "subject", label: "วิชา", value: filters.subject, onChange: (v) => onFilterChange("subject", v), placeholder: "วิชา", options: subjectOptions },
      ]}
      sortValue={`${filters.sortBy}-${filters.sortOrder}`}
      onSortChange={onSortSelectChange}
      sortOptions={[
        { value: "createdAt-desc", label: "วันที่สร้าง (ใหม่-เก่า)" },
        { value: "createdAt-asc", label: "วันที่สร้าง (เก่า-ใหม่)" },
        { value: "name-asc", label: "ชื่อหัวข้อ (ก-ฮ)" },
        { value: "name-desc", label: "ชื่อหัวข้อ (ฮ-ก)" },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.subject !== "all" && `วิชา: ${getSubjectLabel(filters.subject)}`,
      ]}
    />
  );
}
