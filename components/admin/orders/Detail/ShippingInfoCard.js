"use client";
import { MapPin, User, Phone, FileText, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function ShippingInfoCard({ selectedOrder }) {
  const { toast } = useToast();

  if (!selectedOrder.shipping) return null;

  const getShippingText = () => {
    const shipping = selectedOrder.shipping;
    const lines = [
      `ผู้รับ: ${shipping.recipientName || "-"}`,
      `เบอร์โทร: ${shipping.recipientPhone || "-"}`,
      `ที่อยู่: ${shipping.address || "-"}, ${shipping.district || "-"}, ${shipping.province || "-"} ${shipping.postalCode || "-"}`,
      `สถานะการจัดส่ง: ${shipping.status || "-"}`,
    ];
    if (shipping.trackingNumber) lines.push(`เลขติดตาม: ${shipping.trackingNumber}`);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShippingText());
      toast({ title: "คัดลอกข้อมูลการจัดส่งสำเร็จ" });
    } catch (e) {
      toast({ variant: "destructive", title: "คัดลอกข้อมูลไม่สำเร็จ" });
    }
  };

  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MapPin className="h-4 w-4 text-blue-600" />
          ข้อมูลการจัดส่ง
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> คัดลอก
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <User className="h-3.5 w-3.5" /> ผู้รับ
          </div>
          <div className="text-sm font-semibold text-gray-900">{selectedOrder.shipping.recipientName}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Phone className="h-3.5 w-3.5" /> เบอร์โทร
          </div>
          <div className="text-sm text-gray-700">{selectedOrder.shipping.recipientPhone}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5" /> ที่อยู่
          </div>
          <div className="text-sm text-gray-700">
            {selectedOrder.shipping.address}, {selectedOrder.shipping.district}, {selectedOrder.shipping.province} {selectedOrder.shipping.postalCode}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-gray-500">สถานะการจัดส่ง</div>
          <Badge
            variant="outline"
            className={selectedOrder.shipping.status === "DELIVERED" ? "border-green-200 bg-green-50 text-green-700" : "border-blue-200 bg-blue-50 text-blue-700"}
          >
            {selectedOrder.shipping.status}
          </Badge>
        </div>
        {selectedOrder.shipping.trackingNumber && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5" /> เลขติดตาม
            </div>
            <span className="font-mono text-sm text-gray-700">{selectedOrder.shipping.trackingNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
