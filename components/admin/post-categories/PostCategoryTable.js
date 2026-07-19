"use client";
import { Tag, Edit, Trash2, FileText, Calendar, Loader2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SortableTableHead from "@/components/admin/shared/SortableTableHead";
import AdminPagination from "@/components/admin/shared/AdminPagination";

export default function PostCategoryTable({
  postCategories,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onSortChange,
  onPageChange,
  deletingId,
}) {
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalCount || 0) / (pagination?.pageSize || 10)));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการหมวดหมู่โพสต์</h3>
          <Badge variant="secondary">{pagination?.totalCount || 0} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead field="name" label="หมวดหมู่" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} className="min-w-[260px]" />
                <SortableTableHead field="isActive" label="สถานะ" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead>จำนวนโพสต์</TableHead>
                <SortableTableHead field="createdAt" label="วันที่สร้าง" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead className="text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (postCategories || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    ไม่พบหมวดหมู่โพสต์
                  </TableCell>
                </TableRow>
              ) : (
                postCategories.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">{record.name}</div>
                          {record.description && (
                            <div className="truncate text-xs text-gray-500">
                              {record.description.length > 50 ? `${record.description.substring(0, 50)}...` : record.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={record.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}
                      >
                        {record.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {record.posts?.length || 0} โพสต์
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(record.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>แก้ไข</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(record)} disabled={deletingId === record.id}>
                              {deletingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

        <AdminPagination current={pagination?.page || 1} total={totalPages} onPageChange={onPageChange} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
