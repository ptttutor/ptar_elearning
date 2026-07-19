"use client";
import { Eye, Check, X, User, BookOpen, Book, DollarSign, Calendar, FileCheck } from "lucide-react";
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

const ORDER_STATUS_META = {
  COMPLETED: { label: "สำเร็จ", className: "border-green-200 bg-green-50 text-green-700" },
  PENDING: { label: "รอชำระเงิน", className: "border-amber-200 bg-amber-50 text-amber-700" },
  PENDING_VERIFICATION: { label: "รอตรวจสอบ", className: "border-blue-200 bg-blue-50 text-blue-700" },
  CANCELLED: { label: "ยกเลิก", className: "border-red-200 bg-red-50 text-red-700" },
};

const PAYMENT_STATUS_META = {
  COMPLETED: { label: "ชำระแล้ว", className: "border-green-200 bg-green-50 text-green-700" },
  PENDING: { label: "รอชำระ", className: "border-amber-200 bg-amber-50 text-amber-700" },
  PENDING_VERIFICATION: { label: "รอตรวจสอบ", className: "border-blue-200 bg-blue-50 text-blue-700" },
  REJECTED: { label: "ปฏิเสธ", className: "border-red-200 bg-red-50 text-red-700" },
  FREE: { label: "ฟรี", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
};

export default function OrderTable({ orders, loading, actionLoading = false, pagination, onPageChange, onViewDetail, onConfirmPayment, onRejectPayment }) {
  const formatPrice = (price) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleString("th-TH");
  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.pageSize || 20)));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการคำสั่งซื้อ</h3>
          <Badge variant="secondary">{pagination?.total || 0} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสคำสั่งซื้อ</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead className="min-w-[220px]">สินค้า</TableHead>
                <TableHead>ยอดรวม</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การชำระ</TableHead>
                <TableHead>วันที่</TableHead>
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
              ) : (orders || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    ไม่พบคำสั่งซื้อ
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((record) => {
                  const items = record.items && record.items.length > 0
                    ? record.items
                    : [{ title: record.ebook?.title || record.course?.title, itemType: record.orderType, quantity: 1, unitPrice: record.total }];
                  const orderStatusMeta = ORDER_STATUS_META[record.status] || { label: record.status, className: "" };
                  const paymentStatusMeta = PAYMENT_STATUS_META[record.payment?.status] || { label: record.payment?.status || "-", className: "" };

                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-mono text-sm">#{record.id.slice(-8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900">{record.user?.name}</div>
                            <div className="truncate text-xs text-gray-400">{record.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${item.itemType === "EBOOK" ? "bg-purple-500" : "bg-blue-500"}`}>
                                {item.itemType === "EBOOK" ? <Book className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-gray-900" title={item.title}>
                                  {item.title}
                                  {item.quantity > 1 && <span className="ml-1 text-gray-400">x{item.quantity}</span>}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {item.itemType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
                                  {item.unitPrice && <span className="ml-1">{formatPrice(item.unitPrice)}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                          {items.length > 1 && <div className="border-t border-gray-100 pt-1 text-[10px] text-gray-400">รวม {items.length} รายการ</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <DollarSign className="h-3.5 w-3.5" />
                          {formatPrice(record.total)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={orderStatusMeta.className}>{orderStatusMeta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={paymentStatusMeta.className}>{paymentStatusMeta.label}</Badge>
                        {record.payment?.slipUrl && (
                          <div className="mt-1">
                            <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700">
                              <FileCheck className="h-2.5 w-2.5" /> สลิป
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(record.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 border-l border-gray-100 bg-white group-hover:bg-muted/50">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading} onClick={() => onViewDetail(record)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ดู</TooltipContent>
                          </Tooltip>
                          {record.payment?.status === "PENDING_VERIFICATION" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-emerald-600" disabled={actionLoading} onClick={() => onConfirmPayment(record)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>ยืนยัน</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-600" disabled={actionLoading} onClick={() => onRejectPayment(record)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>ปฏิเสธ</TooltipContent>
                              </Tooltip>
                            </>
                          )}
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
