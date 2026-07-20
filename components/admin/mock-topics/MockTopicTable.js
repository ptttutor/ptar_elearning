"use client";
import { Tag as TagIcon, HelpCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SortableTableHead from "@/components/admin/shared/SortableTableHead";
import AdminPagination from "@/components/admin/shared/AdminPagination";
import { getSubjectLabel } from "@/lib/constants";

export default function MockTopicTable({
  topics,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  onSortChange,
}) {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการหัวข้อ</h3>
          <Badge variant="secondary">{pagination.total} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead field="name" label="ชื่อหัวข้อ" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <SortableTableHead field="subject" label="วิชา" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead>จำนวนคำถาม</TableHead>
                <SortableTableHead field="createdAt" label="วันที่สร้าง" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    ไม่พบหัวข้อ
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <TagIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        {topic.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        {getSubjectLabel(topic.subject)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        {topic._count?.questions || 0} ข้อ
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(topic.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(topic)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>แก้ไข</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(topic)}>
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
