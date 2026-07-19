"use client";
import {
  Eye,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ShoppingCart,
  Truck,
  Send,
  Rocket,
  Zap,
  Package,
  Car,
  Copy,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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

export default function ShippingDetailModal({ open, onClose, shipment, loading }) {
  const { toast } = useToast();

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");
  const statusMeta = shipment ? STATUS_META[shipment.status] || { label: shipment.status, className: "" } : null;
  const companyMeta = shipment ? COMPANY_META[shipment.shippingMethod] || { label: shipment.shippingMethod || "ไม่ระบุ", icon: Car, className: "text-gray-400" } : null;
  const CompanyIcon = companyMeta?.icon || Car;

  const getAllShippingText = () => {
    if (!shipment) return "";
    const lines = [
      `ชื่อผู้รับ: ${shipment.recipientName || "-"}`,
      `เบอร์โทร: ${shipment.recipientPhone || "-"}`,
      `ที่อยู่: ${shipment.address || "-"}`,
      `ตำบล/แขวง: ${shipment.district || "-"}`,
      `จังหวัด: ${shipment.province || "-"}`,
      `รหัสไปรษณีย์: ${shipment.postalCode || "-"}`,
      `ประเทศ: ${shipment.country || "-"}`,
      `บริษัทขนส่ง: ${companyMeta?.label || "-"}`,
      `สถานะ: ${statusMeta?.label || "-"}`,
      `เลขติดตาม: ${shipment.trackingNumber || "-"}`,
      `วันที่จัดส่ง: ${formatDate(shipment.shippedAt)}`,
      `วันที่ส่งถึง: ${formatDate(shipment.deliveredAt)}`,
      `หมายเหตุ: ${shipment.notes || "-"}`,
    ];
    if (shipment.order) {
      lines.push(`รหัสคำสั่งซื้อ: #${shipment.order.id?.slice(-8)}`);
      lines.push(`ลูกค้า: ${shipment.order.user?.name || "-"}`);
      lines.push(`สินค้า: ${shipment.order.ebook?.title || shipment.order.course?.title || "-"}`);
      lines.push(`ประเภท: ${shipment.order.ebook ? "E-book" : shipment.order.course ? "Course" : "อื่นๆ"}`);
      lines.push(`วันที่สั่งซื้อ: ${formatDate(shipment.order.createdAt)}`);
      lines.push(`สถานะคำสั่งซื้อ: ${shipment.order.status || "-"}`);
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getAllShippingText());
      toast({ title: "คัดลอกข้อมูลการจัดส่งสำเร็จ" });
    } catch (e) {
      toast({ variant: "destructive", title: "คัดลอกข้อมูลไม่สำเร็จ" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            รายละเอียดการจัดส่ง #{shipment?.orderId?.slice(-8) || "..."}
            {shipment && (
              <Button variant="outline" size="sm" className="ml-2" onClick={handleCopy}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> คัดลอกข้อมูล
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-gray-400" />
            <div className="text-sm text-gray-500">กำลังโหลดรายละเอียด...</div>
          </div>
        ) : shipment ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <User className="h-4 w-4 text-blue-600" /> ข้อมูลผู้รับ
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <User className="h-3.5 w-3.5" /> ชื่อผู้รับ
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{shipment.recipientName}</div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="h-3.5 w-3.5" /> เบอร์โทร
                  </div>
                  <div className="text-sm text-gray-700">{shipment.recipientPhone}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5" /> ที่อยู่
                  </div>
                  <div className="text-sm text-gray-700">{shipment.address}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">ตำบล/แขวง</div>
                  <div className="text-sm text-gray-700">{shipment.district}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">จังหวัด</div>
                  <div className="text-sm text-gray-700">{shipment.province}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">รหัสไปรษณีย์</div>
                  <div className="text-sm text-gray-700">{shipment.postalCode}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">ประเทศ</div>
                  <div className="text-sm text-gray-700">{shipment.country}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Truck className="h-4 w-4 text-blue-600" /> ข้อมูลการจัดส่ง
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Truck className="h-3.5 w-3.5" /> บริษัทขนส่ง
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <CompanyIcon className={`h-4 w-4 ${companyMeta?.className}`} />
                    {companyMeta?.label}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">สถานะ</div>
                  <Badge variant="outline" className={statusMeta?.className}>{statusMeta?.label}</Badge>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5" /> เลขติดตาม
                  </div>
                  {shipment.trackingNumber ? (
                    <span className="font-mono text-sm text-gray-700">{shipment.trackingNumber}</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" /> วันที่จัดส่ง
                  </div>
                  <div className="text-sm text-gray-700">{formatDate(shipment.shippedAt)}</div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" /> วันที่ส่งถึง
                  </div>
                  <div className="text-sm text-gray-700">{formatDate(shipment.deliveredAt)}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-gray-500">หมายเหตุ</div>
                  <div className="text-sm text-gray-700">{shipment.notes || "-"}</div>
                </div>
              </div>
            </div>

            {shipment.order && (
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <ShoppingCart className="h-4 w-4 text-blue-600" /> ข้อมูลคำสั่งซื้อ
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5" /> รหัสคำสั่งซื้อ
                    </div>
                    <span className="font-mono text-sm text-gray-700">#{shipment.order.id.slice(-8)}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <User className="h-3.5 w-3.5" /> ลูกค้า
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{shipment.order.user?.name}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="mb-1 text-xs text-gray-500">สินค้า</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{shipment.order.ebook?.title || shipment.order.course?.title}</span>
                      <Badge variant="outline" className={shipment.order.ebook ? "border-blue-200 bg-blue-50 text-blue-700" : shipment.order.course ? "border-green-200 bg-green-50 text-green-700" : ""}>
                        {shipment.order.ebook ? "E-book" : shipment.order.course ? "Course" : "อื่นๆ"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" /> วันที่สั่งซื้อ
                    </div>
                    <div className="text-sm text-gray-700">{formatDate(shipment.order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-gray-500">สถานะคำสั่งซื้อ</div>
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">{shipment.order.status}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-gray-400">ไม่พบข้อมูล</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
