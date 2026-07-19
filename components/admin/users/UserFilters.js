import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ResultsCount from "@/components/admin/shared/ResultsCount";
import { RESET_FILTERS_LABEL } from "@/components/admin/shared/adminUiConstants";

const ROLE_LABELS = { STUDENT: "นักเรียน", INSTRUCTOR: "ผู้สอน", ADMIN: "ผู้ดูแลระบบ" };

export default function UserFilters({
  filters,
  searchInput,
  setSearchInput,
  onFilterChange,
  onReset,
  totalCount,
  currentCount,
  loading,
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        {/* Search Input */}
        <div className="relative sm:col-span-2 md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อ อีเมล หรือ LINE ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <Select value={filters.role} onValueChange={(value) => onFilterChange("role", value)}>
          <SelectTrigger>
            <SelectValue placeholder="บทบาท" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="STUDENT">นักเรียน</SelectItem>
            <SelectItem value="INSTRUCTOR">ผู้สอน</SelectItem>
            <SelectItem value="ADMIN">ผู้ดูแลระบบ</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="active">เปิดใช้งาน</SelectItem>
            <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        <Button variant="outline" onClick={onReset} disabled={loading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {RESET_FILTERS_LABEL}
        </Button>
      </div>

      {/* Sort Order */}
      <div className="mt-4 max-w-xs">
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-");
            onFilterChange("sortBy", sortBy);
            onFilterChange("sortOrder", sortOrder);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="เรียงลำดับ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">ใหม่ล่าสุด</SelectItem>
            <SelectItem value="createdAt-asc">เก่าสุด</SelectItem>
            <SelectItem value="name-asc">ชื่อ A-Z</SelectItem>
            <SelectItem value="name-desc">ชื่อ Z-A</SelectItem>
            <SelectItem value="email-asc">อีเมล A-Z</SelectItem>
            <SelectItem value="email-desc">อีเมล Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="mt-4 flex flex-wrap items-center gap-x-2 border-t border-gray-100 pt-4">
        <ResultsCount current={currentCount} total={totalCount} />
        {filters.search && (
          <span className="text-sm text-gray-500">
            ค้นหา: &quot;<strong>{filters.search}</strong>&quot;
          </span>
        )}
        {filters.role !== "all" && (
          <span className="text-sm text-gray-500">
            บทบาท: <strong>{ROLE_LABELS[filters.role] || filters.role}</strong>
          </span>
        )}
        {filters.status !== "all" && (
          <span className="text-sm text-gray-500">
            สถานะ: <strong>{filters.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
