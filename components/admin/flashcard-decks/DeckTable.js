"use client";
import { Layers, Edit, Trash2, HelpCircle, ImageOff, Tag as TagIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SortableTableHead from "@/components/admin/shared/SortableTableHead";
import AdminPagination from "@/components/admin/shared/AdminPagination";
import { getSubjectLabel, getGradeLevelLabel } from "@/lib/constants";

export default function DeckTable({
  decks,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageCards,
  onPageChange,
  onSortChange,
}) {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการชุดแฟลชการ์ด</h3>
          <Badge variant="secondary">{pagination.total} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ปก</TableHead>
                <SortableTableHead field="title" label="ชื่อชุด" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} className="max-w-[200px]" />
                <SortableTableHead field="subject" label="วิชา" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead>ระดับชั้น</TableHead>
                <TableHead>หัวข้อที่ผูก</TableHead>
                <TableHead>จำนวนการ์ด</TableHead>
                <SortableTableHead field="isActive" label="สถานะ" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : decks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    ไม่พบชุดแฟลชการ์ด
                  </TableCell>
                </TableRow>
              ) : (
                decks.map((deck) => (
                  <TableRow key={deck.id} className={!deck.isActive ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                        {deck.coverImageUrl ? (
                          <img src={deck.coverImageUrl} alt={deck.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageOff className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900" title={deck.title}>
                        <Layers className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{deck.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        {getSubjectLabel(deck.subject)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {deck.gradeLevel ? getGradeLevelLabel(deck.gradeLevel) : "-"}
                    </TableCell>
                    <TableCell>
                      {deck.topic ? (
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                          <TagIcon className="mr-1 h-3 w-3" />
                          {deck.topic.name}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        {deck._count?.cards || 0} ใบ
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={deck.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}
                      >
                        {deck.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onManageCards(deck)}>
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>จัดการการ์ด</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(deck)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>แก้ไข</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(deck)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>ลบ</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination current={pagination.current} total={totalPages} onPageChange={onPageChange} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
