"use client";
import { Eye, Edit, User, Phone, MapPin, Calendar, Truck, Send, Rocket, Zap, Package, Car, Loader2 } from "lucide-react";
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

const STATUS_META = {
  PENDING: { label: "รอดำเนินการ", className: "border-gray-200 bg-gray-50 text-gray-700" },
  PROCESSING: { label: "กำลังเตรียม", className: "border-blue-200 bg-blue-50 text-blue-700" },
  SHIPPED: { label: "จัดส่งแล้ว", className: "border-amber-200 bg-amber-50 text-amber-700" },
  DELIVERED: { label: "ส่งถึงแล้ว", className: "border-green-200 bg-green-50 text-green-700" },
  CANCELLED: { label: "ยกเลิก", className: "border-red-200 bg-red-50 text-red-700" },
};

const COMPANY_META = {
  KERRY: { label: "Kerry Express", icon: Truck, className: "text-emerald-600" },
  THAILAND_POST: { label: "ไปรษณีย์ไทย", icon: Send, className: "text-blue-600" },
  JT_EXPRESS: { label: "J&T Express", icon: Package, className: "text-purple-600" },
  FLASH_EXPRESS: { label: "Flash Express", icon: Zap, className: "text-orange-600" },
  NINJA_VAN: { label: "Ninja Van", icon: Rocket, className: "text-pink-600" },
  PENDING: { label: "รอเลือก", icon: Car, className: "text-gray-400" },
};

export default function ShippingTable({ shipments, loading, pagination, onViewDetail, onEdit, onPageChange, updatingId }) {
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.totalCount || 0) / (pagination?.pageSize || 10)));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">รายการจัดส่ง</h3>
          <Badge variant="secondary">{pagination?.totalCount || 0} รายการ</Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสคำสั่งซื้อ</TableHead>
                <TableHead>ผู้รับ</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead className="min-w-[200px]">ที่อยู่</TableHead>
                <TableHead>บริษัทขนส่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>เลขติดตาม</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead className="sticky right-0 z-10 border-l border-gray-100 bg-white text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (shipments || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400">
                    ไม่พบข้อมูลการจัดส่ง
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((record) => {
                  const isEbook = record.order?.ebook;
                  const isCourse = record.order?.course;
                  const statusMeta = STATUS_META[record.status] || { label: record.status, className: "" };
                  const companyMeta = COMPANY_META[record.shippingMethod] || { label: record.shippingMethod || "ไม่ระบุ", icon: Car, className: "text-gray-400" };
                  const CompanyIcon = companyMeta.icon;

                  return (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-mono text-xs">#{record.orderId?.slice(-8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900">{record.recipientName}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone className="h-3 w-3" /> {record.recipientPhone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[160px] truncate text-sm font-medium text-gray-900">
                          {isEbook ? record.order.ebook.title : isCourse ? record.order.course.title : "ไม่ระบุ"}
                        </div>
                        <Badge variant="outline" className={isEbook ? "border-blue-200 bg-blue-50 text-blue-700" : isCourse ? "border-green-200 bg-green-50 text-green-700" : ""}>
                          {isEbook ? "E-book" : isCourse ? "Course" : "อื่นๆ"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <div className="min-w-0">
                            <div className="truncate text-sm text-gray-700">{record.address}</div>
                            <div className="truncate text-xs text-gray-400">
                              {record.district}, {record.province} {record.postalCode}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <CompanyIcon className={`h-4 w-4 ${companyMeta.className}`} />
                          {companyMeta.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusMeta.className}>{statusMeta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {record.trackingNumber ? (
                          <span className="font-mono text-xs text-gray-700">{record.trackingNumber}</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(record.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 border-l border-gray-100 bg-white group-hover:bg-muted/50">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onViewDetail(record)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ดูรายละเอียด</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onEdit(record)} disabled={updatingId === record.id}>
                                {updatingId === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>อัพเดท</TooltipContent>
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
