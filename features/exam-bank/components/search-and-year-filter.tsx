import { Calendar, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchAndYearFilter({
  searchTerm,
  onSearchChange,
  selectedYear,
  onYearChange,
  yearOptions,
}: {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  yearOptions: number[]
}) {
  return (
    <div className="flex flex-row gap-3 items-center max-w-2xl mx-auto w-85 md:w-full">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input type="text" placeholder="ค้นหาข้อสอบ..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-10 pr-4 py-2 w-full" />
      </div>
      <div className="shrink-0">
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-33 sm:w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="เลือกปี" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกปี</SelectItem>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                ปี {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
