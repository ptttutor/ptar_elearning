"use client";
import { FileText, Edit, Trash2, HelpCircle, Clock, CheckCircle2, XCircle, BookOpen, Zap } from "lucide-react";
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

export default function MockExamTable({
  exams,
  loading,
  filters,
  pagination,
  onEdit,
  onDelete,
  onManageQuestions,
  onPageChange,
  onSortChange,
}) {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการข้อสอบจำลอง</h3>
          <Badge variant="secondary">{pagination.total} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead field="title" label="ชื่อข้อสอบจำลอง" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} className="max-w-[220px]" />
                <SortableTableHead field="subject" label="วิชา" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead>จำนวนข้อ</TableHead>
                <TableHead>เวลาจำกัด</TableHead>
                <TableHead>โหมด</TableHead>
                <SortableTableHead field="isActive" label="สถานะ" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onSort={onSortChange} />
                <TableHead className="text-right">การจัดการ</TableHead>
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
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    ไม่พบข้อสอบจำลอง
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="max-w-[220px]">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{exam.title}</span>
                      </div>
                      {exam.course && <div className="mt-0.5 text-xs text-gray-500">คอร์ส: {exam.course.title}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        {getSubjectLabel(exam.subject)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        {exam._count?.questions || 0} ข้อ
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-orange-400" />
                        {exam.timeLimit ? `${exam.timeLimit} นาที` : "ไม่จำกัด"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {exam.allowPracticeMode && (
                          <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-700">
                            <BookOpen className="mr-1 h-3 w-3" />
                            ฝึกฝน ({exam.practiceUnlockCost} token/ข้อ)
                          </Badge>
                        )}
                        {exam.allowRealMode && (
                          <Badge variant="outline" className="w-fit border-orange-200 bg-orange-50 text-orange-700">
                            <Zap className="mr-1 h-3 w-3" />
                            สอบจริง ({exam.attemptsAllowed} ครั้ง)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={exam.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600"}
                      >
                        {exam.isActive ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {exam.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(exam)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>แก้ไข</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onManageQuestions(exam)}>
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>จัดการคำถาม</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(exam)}>
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
