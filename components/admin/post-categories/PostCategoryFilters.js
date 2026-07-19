import { useEffect, useRef } from "react";
import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const STATUS_OPTIONS = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "ACTIVE", label: "ใช้งาน" },
  { value: "INACTIVE", label: "ไม่ใช้งาน" },
];

export default function PostCategoryFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
}) {
  // usePostCategories has no built-in search debounce (unlike useAdminListState),
  // so debounce here to avoid firing a fetch on every keystroke.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => onFilterChange("search", searchInput), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <AdminFilterBar
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาหมวดหมู่โพสต์..."
      selects={[
        { key: "status", value: filters.status, onChange: (v) => onFilterChange("status", v), placeholder: "สถานะ", options: STATUS_OPTIONS },
      ]}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      activeSummary={[
        filters.search && `ค้นหา: "${filters.search}"`,
        filters.status !== "ALL" && `สถานะ: ${STATUS_OPTIONS.find((o) => o.value === filters.status)?.label || filters.status}`,
      ]}
    />
  );
}
