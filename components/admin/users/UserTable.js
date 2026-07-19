"use client";

import { Edit, Repeat, BookPlus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const ROLE_STYLES = {
  STUDENT: "border-green-200 bg-green-50 text-green-700",
  INSTRUCTOR: "border-orange-200 bg-orange-50 text-orange-700",
  ADMIN: "border-red-200 bg-red-50 text-red-700",
};
const ROLE_LABELS = { STUDENT: "นักเรียน", INSTRUCTOR: "ผู้สอน", ADMIN: "ผู้ดูแลระบบ" };

export default function UserTable({
  users,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onGrantCourse,
  onPageChange,
  onSortChange,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
    } catch {
      return "-";
    }
  };

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการผู้ใช้งาน</h3>
          <Badge variant="secondary">{pagination.total} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[260px]">ผู้ใช้งาน</TableHead>
                <SortableTableHead
                  field="role"
                  label="บทบาท"
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSort={onSortChange}
                />
                <TableHead>สถานะ</TableHead>
                <TableHead>LINE ID</TableHead>
                <SortableTableHead
                  field="createdAt"
                  label="วันที่สร้าง"
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSort={onSortChange}
                />
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400">
                    ไม่พบผู้ใช้งาน
                  </TableCell>
                </TableRow>
              ) : (
                users.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {record.image && <AvatarImage src={record.image} alt={record.name} />}
                          <AvatarFallback className="bg-blue-500 text-white">
                            {record.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">
                            {record.name || "ไม่ระบุชื่อ"}
                          </div>
                          <div className="truncate text-xs text-gray-500">{record.email}</div>
                          {record.lineId && (
                            <div className="text-xs text-gray-400">
                              LINE: {record.lineId.substring(0, 10)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_STYLES[record.role]}>
                        {ROLE_LABELS[record.role] || record.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        เปิดใช้งาน
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {record.lineId ? `${record.lineId.substring(0, 10)}...` : "ไม่เชื่อมต่อ"}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-gray-500">{formatDate(record.createdAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{new Date(record.createdAt).toLocaleString("th-TH")}</TooltipContent>
                      </Tooltip>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-500"
                              onClick={() => onToggleStatus(record)}
                              disabled={record.role === "ADMIN"}
                            >
                              <Repeat className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {record.role === "STUDENT" ? "เปลี่ยนเป็นผู้สอน" : "เปลี่ยนเป็นนักเรียน"}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => onGrantCourse(record)}
                              disabled={record.role === "ADMIN"}
                            >
                              <BookPlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>เพิ่มคอร์สให้ผู้ใช้ (ไม่ผ่านการซื้อ)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => onDelete(record)}
                              disabled={record.role === "ADMIN"}
                            >
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

        <AdminPagination
          current={pagination.current}
          total={totalPages}
          onPageChange={onPageChange}
          className="mt-4"
        />
      </div>
    </TooltipProvider>
  );
}
