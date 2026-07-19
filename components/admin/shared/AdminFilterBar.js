import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ResultsCount from "@/components/admin/shared/ResultsCount";
import { RESET_FILTERS_LABEL } from "@/components/admin/shared/adminUiConstants";

/**
 * Canonical admin filter bar: search input + N dropdown filters + reset
 * button, an optional sort dropdown below, and a results-summary strip —
 * pulled out of UserFilters.js so every admin list page (Users, Courses,
 * Orders, ...) looks and behaves the same instead of hand-rolling this
 * layout per section.
 *
 * @param {object} props
 * @param {string} [props.searchLabel]
 * @param {string} props.searchValue
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} [props.searchPlaceholder]
 * @param {Array<{key:string, label:string, value:string, onChange:(v:string)=>void, placeholder:string, options:Array<{value:string,label:string}>}>} [props.selects]
 *   One entry per dropdown filter (role, status, category, ...).
 * @param {string} [props.sortLabel]
 * @param {string} [props.sortValue] Combined `${sortBy}-${sortOrder}` value.
 * @param {(value: string) => void} [props.onSortChange]
 * @param {Array<{value:string,label:string}>} [props.sortOptions]
 * @param {() => void} props.onReset
 * @param {number} props.totalCount
 * @param {number} props.currentCount
 * @param {boolean} [props.loading]
 * @param {string[]} [props.activeSummary] Extra "ค้นหา: ..." / "บทบาท: ..."
 *   strings to show next to the results count — caller derives these from
 *   its own filters state since the labels are resource-specific.
 */
export default function AdminFilterBar({
  searchLabel = "ค้นหา",
  searchValue,
  onSearchChange,
  searchPlaceholder = "ค้นหา...",
  selects = [],
  sortLabel = "เรียงลำดับ",
  sortValue,
  onSortChange,
  sortOptions,
  onReset,
  totalCount,
  currentCount,
  loading,
  activeSummary = [],
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="space-y-2 sm:col-span-2 md:col-span-2">
          <Label>{searchLabel}</Label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selects.map((select) => (
          <div key={select.key} className="space-y-2">
            <Label>{select.label || select.placeholder}</Label>
            <Select value={select.value} onValueChange={select.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={select.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {select.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="flex items-end">
          <Button variant="outline" onClick={onReset} disabled={loading} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            {RESET_FILTERS_LABEL}
          </Button>
        </div>
      </div>

      {sortOptions && (
        <div className="mt-4 max-w-xs space-y-2">
          <Label>{sortLabel}</Label>
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={sortLabel} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-2 border-t border-gray-100 pt-4">
        <ResultsCount current={currentCount} total={totalCount} />
        {activeSummary.filter(Boolean).map((line, i) => (
          <span key={i} className="text-sm text-gray-500">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
