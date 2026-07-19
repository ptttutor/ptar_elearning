"use client";
import { useState, useMemo } from "react";
import { Layers, Edit, Trash2, FileText, Calendar, CheckCircle2 } from "lucide-react";
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
import AdminFilterBar from "@/components/admin/shared/AdminFilterBar";
import AdminPagination from "@/components/admin/shared/AdminPagination";

const PAGE_SIZE = 10;

export default function CategoriesTable({
  categories,
  loading,
  onEdit,
  onDelete,
  disabled = false,
  deleting = null,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  }, [categories, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TooltipProvider delayDuration={200}>
      <AdminFilterBar
        searchValue={searchInput}
        onSearchChange={(v) => {
          setSearchInput(v);
          setPage(1);
        }}
        searchPlaceholder="ค้นหาชื่อหรือรายละเอียดหมวดหมู่..."
        onReset={() => {
          setSearchInput("");
          setPage(1);
        }}
        totalCount={categories.length}
        currentCount={filtered.length}
        loading={loading}
        activeSummary={[searchInput && `ค้นหา: "${searchInput}"`]}
      />

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการหมวดหมู่</h3>
          <Badge variant="secondary">{filtered.length} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">หมวดหมู่</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
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
              ) : paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    ไม่พบหมวดหมู่
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                          <Layers className="h-4 w-4" />
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
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {record.description || <span className="text-gray-400">ไม่มีรายละเอียด</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        ใช้งาน
                      </Badge>
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
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(record)} disabled={disabled}>
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
                              className="text-red-600"
                              onClick={() => onDelete(record.id, record.name)}
                              disabled={disabled || (deleting && deleting !== record.id)}
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

        <AdminPagination current={page} total={totalPages} onPageChange={setPage} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
