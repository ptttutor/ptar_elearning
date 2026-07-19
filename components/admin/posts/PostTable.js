"use client";
import { FileText, Edit, Trash2, User, Calendar, Star, CheckCircle2, XCircle, Tag, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
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
import AdminPagination from "@/components/admin/shared/AdminPagination";

export default function PostTable({ posts, loading, pagination, onPageChange, onEdit, onDelete, onManageContent }) {
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalCount || 0) / (pagination?.pageSize || 10)));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการโพสต์</h3>
          <Badge variant="secondary">{pagination?.totalCount || 0} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">โพสต์</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ผู้เขียน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่เผยแพร่</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="sticky right-0 z-10 border-l border-gray-100 bg-white text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (posts || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    ไม่พบโพสต์
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((record) => (
                  <TableRow key={record.id} className="group">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-400">
                          {record.imageUrl?.trim() ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={record.imageUrl} alt={record.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[280px]">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-semibold text-gray-900">{record.title}</span>
                            {record.isFeatured && (
                              <Badge variant="outline" className="shrink-0 gap-1 border-amber-200 bg-amber-50 text-amber-700">
                                <Star className="h-3 w-3" /> แนะนำ
                              </Badge>
                            )}
                          </div>
                          {record.excerpt && (
                            <div className="truncate text-xs text-gray-500">
                              {record.excerpt.length > 80 ? `${record.excerpt.substring(0, 80)}...` : record.excerpt}
                            </div>
                          )}
                          {record.slug && (
                            <div className="flex items-center gap-1 truncate text-xs text-gray-400">
                              <LinkIcon className="h-3 w-3" />
                              {record.slug}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.postType ? (
                        <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                          <Tag className="h-3 w-3" /> {record.postType.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">ไม่ระบุ</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {record.author?.name || "ไม่ระบุ"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={record.isActive ? "gap-1 border-green-200 bg-green-50 text-green-700" : "gap-1 border-red-200 bg-red-50 text-red-700"}
                      >
                        {record.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {record.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(record.publishedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(record.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="sticky right-0 z-10 border-l border-gray-100 bg-white group-hover:bg-muted/50">
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
                            <Button variant="ghost" size="icon" className="text-emerald-600" onClick={() => onManageContent(record)}>
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>จัดการเนื้อหา</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(record)}>
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

        <AdminPagination current={pagination?.page || 1} total={totalPages} onPageChange={onPageChange} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
