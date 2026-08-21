"use client";
import { Edit, Trash2, ImageOff, ListChecks, Type, RotateCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AdminPagination from "@/components/admin/shared/AdminPagination";

const MODE_META = {
  SELF_GRADE: { label: "พลิกเอง", icon: RotateCw, className: "border-gray-200 bg-gray-50 text-gray-600" },
  MULTIPLE_CHOICE: { label: "เลือกตอบ", icon: ListChecks, className: "border-blue-200 bg-blue-50 text-blue-700" },
  TYPED: { label: "พิมพ์ตอบ", icon: Type, className: "border-purple-200 bg-purple-50 text-purple-700" },
};

export default function CardTable({ cards, loading, pagination, onEdit, onDelete, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการการ์ด</h3>
          <Badge variant="secondary">{pagination.total} ใบ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รูป</TableHead>
                <TableHead className="max-w-[260px]">คำถาม</TableHead>
                <TableHead>รูปแบบการตอบ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">
                    ยังไม่มีการ์ดในชุดนี้
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => {
                  const meta = MODE_META[card.answerMode] || MODE_META.SELF_GRADE;
                  const Icon = meta.icon;
                  return (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                          {card.frontImage ? (
                            <img src={card.frontImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <p className="truncate text-sm font-medium text-gray-900" title={card.front}>
                          {card.front}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={meta.className}>
                          <Icon className="mr-1 h-3 w-3" />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(card)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>แก้ไข</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(card)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ลบ</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination current={pagination.current} total={totalPages} onPageChange={onPageChange} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
