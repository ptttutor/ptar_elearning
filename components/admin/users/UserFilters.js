import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const ROLE_LABELS = { STUDENT: "นักเรียน", INSTRUCTOR: "ผู้สอน", ADMIN: "ผู้ดูแลระบบ" };

const ROLE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "STUDENT", label: "นักเรียน" },
  { value: "INSTRUCTOR", label: "ผู้สอน" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "active", label: "เปิดใช้งาน" },
  { value: "inactive", label: "ปิดใช้งาน" },
];

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "ใหม่ล่าสุด" },
  { value: "createdAt-asc", label: "เก่าสุด" },
  { value: "name-asc", label: "ชื่อ A-Z" },
  { value: "name-desc", label: "ชื่อ Z-A" },
  { value: "email-asc", label: "อีเมล A-Z" },
  { value: "email-desc", label: "อีเมล Z-A" },
];

export default function UserFilters({
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
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาชื่อ อีเมล หรือ LINE ID..."
      selects={[
        { key: "role", value: filters.role, onChange: (v) => onFilterChange("role", v), placeholder: "บทบาท", options: ROLE_OPTIONS },
        { key: "status", value: filters.status, onChange: (v) => onFilterChange("status", v), placeholder: "สถานะ", options: STATUS_OPTIONS },
      ]}
      sortValue={`${filters.sortBy}-${filters.sortOrder}`}
      onSortChange={onSortSelectChange}
      sortOptions={SORT_OPTIONS}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.role !== "all" && `บทบาท: ${ROLE_LABELS[filters.role] || filters.role}`,
        filters.status !== "all" && `สถานะ: ${filters.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}`,
      ]}
    />
  );
}
