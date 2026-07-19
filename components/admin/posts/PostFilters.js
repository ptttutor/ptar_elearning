"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";

const SORT_OPTIONS = [
  { value: "created_desc", label: "สร้างล่าสุด" },
  { value: "created_asc", label: "สร้างเก่าสุด" },
  { value: "title_asc", label: "หัวข้อ (A → Z)" },
  { value: "title_desc", label: "หัวข้อ (Z → A)" },
  { value: "author_asc", label: "ผู้เขียน (A → Z)" },
  { value: "author_desc", label: "ผู้เขียน (Z → A)" },
  { value: "type_asc", label: "ประเภท (A → Z)" },
  { value: "type_desc", label: "ประเภท (Z → A)" },
  { value: "published_desc", label: "เผยแพร่ล่าสุด" },
  { value: "published_asc", label: "เผยแพร่เก่าสุด" },
];

export default function PostFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onSortSelectChange,
  onReset,
  postTypes = [],
  authors = [],
  totalCount,
  currentCount,
  loading,
}) {
  const postTypeOptions = [
    { value: "all", label: "ทั้งหมด" },
    ...postTypes.map((t) => ({ value: t.id, label: t.name || "ไม่ระบุประเภท" })),
  ];

  return (
    <AdminFilterBar
      searchLabel="ค้นหาโพสต์"
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="ค้นหาจากหัวข้อ เนื้อหา หรือสรุป..."
      selects={[
        { key: "postTypeId", value: filters.postTypeId, onChange: (v) => onFilterChange("postTypeId", v), label: "ประเภทโพสต์", placeholder: "เลือกประเภท", options: postTypeOptions },
      ]}
      extraFields={[
        {
          key: "dateRange",
          label: "ช่วงวันที่สร้าง",
          span: 2,
          render: () => (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-normal text-gray-500">จากวันที่</Label>
                <Input type="date" value={filters.dateFrom} onChange={(e) => onFilterChange("dateFrom", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-normal text-gray-500">ถึงวันที่</Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => onFilterChange("dateTo", e.target.value)} />
              </div>
            </div>
          ),
        },
      ]}
      sortLabel="เรียงตาม"
      sortValue={filters.sortBy}
      onSortChange={onSortSelectChange}
      sortOptions={SORT_OPTIONS}
      onReset={onReset}
      totalCount={totalCount}
      currentCount={currentCount}
      loading={loading}
      activeSummary={[
        searchInput && `ค้นหา: "${searchInput}"`,
        filters.postTypeId !== "all" && `ประเภท: ${postTypes.find((t) => t.id === filters.postTypeId)?.name || filters.postTypeId}`,
        (filters.dateFrom || filters.dateTo) && `วันที่: ${filters.dateFrom || "..."} - ${filters.dateTo || "..."}`,
        filters.sortBy !== "created_desc" && `เรียงตาม: ${SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || filters.sortBy}`,
      ]}
    />
  );
}
