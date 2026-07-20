"use client";
import { HelpCircle, Edit, Trash2, CheckCircle2, XCircle, Image as ImageIcon, Tag as TagIcon, FileText } from "lucide-react";
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
import AdminPagination from "@/components/admin/shared/AdminPagination";

const QUESTION_TYPE_LABELS = {
  MULTIPLE_CHOICE: "เลือกตอบ",
  TRUE_FALSE: "จริง/เท็จ",
  SHORT_ANSWER: "ตอบสั้น",
};
const QUESTION_TYPE_STYLES = {
  MULTIPLE_CHOICE: "border-blue-200 bg-blue-50 text-blue-700",
  TRUE_FALSE: "border-green-200 bg-green-50 text-green-700",
  SHORT_ANSWER: "border-orange-200 bg-orange-50 text-orange-700",
};

export default function MockQuestionTable({
  questions,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.pageSize));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการคำถาม</h3>
          <Badge variant="secondary">{pagination.total} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[360px]">คำถาม</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ตัวเลือก/คำตอบที่ถูก</TableHead>
                <TableHead>คะแนน</TableHead>
                <TableHead>เฉลย</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
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
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400">
                    ไม่พบคำถาม
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => {
                  const correctOptions = q.options?.filter((opt) => opt.isCorrect) || [];
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="max-w-[360px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          {q.questionImage && <ImageIcon className="h-3.5 w-3.5 text-green-500" />}
                          {q.topic && (
                            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                              <TagIcon className="mr-1 h-3 w-3" />
                              {q.topic.name}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-700">{q.questionText}</p>
                        {q.questionImage && (
                          <img src={q.questionImage} alt="" className="mt-1.5 h-12 w-16 rounded object-cover" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={QUESTION_TYPE_STYLES[q.questionType]}>
                          {QUESTION_TYPE_LABELS[q.questionType] || q.questionType}
                        </Badge>
                        {q.questionType === "SHORT_ANSWER" && q.numericTolerance != null && (
                          <div className="mt-1 text-xs text-gray-500">±{q.numericTolerance}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {q.questionType === "SHORT_ANSWER" ? (
                          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                            <FileText className="mr-1 h-3 w-3" />
                            {q.options?.[0]?.optionText || "-"}
                          </Badge>
                        ) : (
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-semibold text-green-600">{correctOptions.length}</span>
                              <span className="text-gray-500"> / {q.options?.length || 0} ตัวเลือก</span>
                            </div>
                            {correctOptions.slice(0, 2).map((opt) => (
                              <div key={opt.id} className="flex items-center gap-1 text-xs text-gray-600">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span className="truncate">{opt.optionText}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-orange-600">{q.marks} คะแนน</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {q.explanation ? (
                            <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              มีเฉลย
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-fit border-gray-200 bg-gray-50 text-gray-500">
                              <XCircle className="mr-1 h-3 w-3" />
                              ไม่มีเฉลย
                            </Badge>
                          )}
                          {q.explanationImages?.length > 0 && (
                            <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-700">
                              <ImageIcon className="mr-1 h-3 w-3" />
                              {q.explanationImages.length} รูป
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(q)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>แก้ไข</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onDelete(q)}>
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
