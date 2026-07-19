"use client";
import { Edit, Trash2, Power } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminPagination from "@/components/admin/shared/AdminPagination";

const TYPE_META = {
  PERCENTAGE: { label: "ส่วนลด %", className: "border-blue-200 bg-blue-50 text-blue-700" },
  FIXED_AMOUNT: { label: "จำนวนคงที่", className: "border-green-200 bg-green-50 text-green-700" },
  FREE_SHIPPING: { label: "ฟรีค่าส่ง", className: "border-orange-200 bg-orange-50 text-orange-700" },
};

export default function CouponTable({ coupons, loading, pagination, onPageChange, onEdit, onDelete, onToggleStatus }) {
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalCount || 0) / (pagination?.pageSize || 10)));

  const formatValue = (coupon) => {
    if (coupon.type === "PERCENTAGE") return `${coupon.value}%`;
    if (coupon.type === "FIXED_AMOUNT") return `฿${coupon.value?.toLocaleString()}`;
    return "ฟรีค่าส่ง";
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการคูปอง</h3>
          <Badge variant="secondary">{pagination?.totalCount || 0} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสคูปอง</TableHead>
                <TableHead>ชื่อคูปอง</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ค่าส่วนลด</TableHead>
                <TableHead>จำกัดใช้งาน</TableHead>
                <TableHead>วันที่หมดอายุ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="sticky right-0 z-10 border-l border-gray-100 bg-white text-right">การดำเนินการ</TableHead>
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
              ) : (coupons || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    ไม่พบคูปอง
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((record) => {
                  const typeMeta = TYPE_META[record.type] || { label: record.type, className: "" };
                  const percentage = record.usagePercentage || 0;
                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell>
                        <span className="font-mono font-semibold text-gray-900">{record.code}</span>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{record.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeMeta.className}>{typeMeta.label}</Badge>
                      </TableCell>
                      <TableCell>{formatValue(record)}</TableCell>
                      <TableCell className="min-w-[130px]">
                        {!record.usageLimit ? (
                          <span className="text-sm text-gray-400">ไม่จำกัด</span>
                        ) : (
                          <div>
                            <div className="mb-1 text-xs text-gray-500">
                              {record.usageCount}/{record.usageLimit}
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={record.isExpired ? "text-red-600" : "text-gray-700"}>
                          {new Date(record.validUntil).toLocaleDateString("th-TH")}
                        </div>
                        <div className={`text-xs ${record.isExpired ? "text-red-500" : "text-gray-400"}`}>
                          {record.isExpired ? "หมดอายุแล้ว" : `อีก ${record.daysLeft} วัน`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.isExpired ? (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">หมดอายุ</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={record.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}
                          >
                            {record.isActive ? "ใช้งานได้" : "ไม่ใช้งาน"}
                          </Badge>
                        )}
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className={record.isActive ? "text-gray-500" : "text-emerald-600"}
                                onClick={() => onToggleStatus(record)}
                                disabled={record.isExpired}
                              >
                                <Power className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{record.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={() => onDelete(record)}
                                disabled={record.usageCount > 0}
                              >
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

        <AdminPagination current={pagination?.page || 1} total={totalPages} onPageChange={onPageChange} className="mt-4" />
      </div>
    </TooltipProvider>
  );
}
