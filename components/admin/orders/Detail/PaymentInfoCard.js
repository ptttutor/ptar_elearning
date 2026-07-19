"use client";
import { Landmark, Calendar, FileText, User, X, DollarSign, Eye, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_BOX = {
  PENDING_VERIFICATION: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: AlertTriangle, label: "รอการตรวจสอบ" },
  COMPLETED: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: CheckCircle2, label: "ตรวจสอบแล้ว" },
  REJECTED: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: X, label: "ปฏิเสธแล้ว" },
};

export default function PaymentInfoCard({
  selectedOrder,
  formatPrice,
  formatDate,
  getPaymentStatusColor,
  getPaymentStatusText,
}) {
  const status = selectedOrder.payment?.status;
  const statusBox = STATUS_BOX[status] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: Info, label: status || "ไม่ระบุสถานะ" };
  const StatusIcon = statusBox.icon;

  const isBankTransfer = selectedOrder.payment?.method === "BANK_TRANSFER" || selectedOrder.payment?.method === "bank_transfer";

  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Landmark className="h-4 w-4 text-blue-600" />
        ข้อมูลการชำระเงิน
      </div>

      <div className={`mb-4 rounded-md border p-3 ${statusBox.bg} ${statusBox.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`flex items-center gap-2 text-base font-semibold ${statusBox.text}`}>
              <StatusIcon className="h-4 w-4" />
              {statusBox.label}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {selectedOrder.payment?.slipUrl ? "มีสลิปการโอนเงิน" : "ยังไม่มีสลิปการโอนเงิน"}
            </div>
          </div>
          <Badge variant="outline" className={`${statusBox.text} ${statusBox.border} ${statusBox.bg}`}>
            {getPaymentStatusText(status)}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Landmark className="h-3.5 w-3.5" /> วิธีการชำระ
          </div>
          <div className="text-sm text-gray-700">
            {isBankTransfer ? "โอนเงินผ่านธนาคาร" : selectedOrder.payment?.method === "FREE" ? "ฟรี" : selectedOrder.payment?.method || "ไม่ระบุ"}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-gray-500">สถานะรายละเอียด</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${statusBox.text} ${statusBox.border} ${statusBox.bg}`}>{getPaymentStatusText(status)}</Badge>
            {selectedOrder.payment?.slipUrl && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">มีสลิป</Badge>}
          </div>
        </div>

        {selectedOrder.payment?.ref && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5" /> เลขอ้างอิง
            </div>
            <span className="font-mono text-sm text-gray-700">{selectedOrder.payment.ref}</span>
          </div>
        )}
        {selectedOrder.payment?.paidAt && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" /> วันที่ชำระ
            </div>
            <div className="text-sm text-gray-700">{formatDate(selectedOrder.payment.paidAt)}</div>
          </div>
        )}
        {selectedOrder.payment?.uploadedAt && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" /> วันที่อัพโหลดสลิป
            </div>
            <div className="text-sm text-gray-700">{formatDate(selectedOrder.payment.uploadedAt)}</div>
          </div>
        )}
        {selectedOrder.payment?.verifiedAt && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" /> วันที่ตรวจสอบ
            </div>
            <div className="text-sm text-gray-700">{formatDate(selectedOrder.payment.verifiedAt)}</div>
          </div>
        )}
        {selectedOrder.payment?.verifiedBy && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <User className="h-3.5 w-3.5" /> ตรวจสอบโดย
            </div>
            <div className="text-sm text-gray-700">{selectedOrder.payment.verifiedBy}</div>
          </div>
        )}
        {selectedOrder.payment?.rejectionReason && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-red-500">
              <X className="h-3.5 w-3.5" /> เหตุผลการปฏิเสธ
            </div>
            <div className="text-sm text-red-600">{selectedOrder.payment.rejectionReason}</div>
          </div>
        )}
        {selectedOrder.payment?.notes && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5" /> หมายเหตุ
            </div>
            <div className="text-sm text-gray-700">{selectedOrder.payment.notes}</div>
          </div>
        )}
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign className="h-3.5 w-3.5" /> จำนวนเงิน
          </div>
          <div className="text-base font-semibold text-emerald-600">{formatPrice(selectedOrder.payment?.amount || selectedOrder.total)}</div>
        </div>
      </div>

      {isBankTransfer && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-blue-600" />
            หลักฐานการโอนเงิน
          </div>

          {selectedOrder.payment?.slipUrl ? (
            <div>
              <div className="rounded-lg border border-gray-100 p-4 text-center">
                <a href={selectedOrder.payment.slipUrl} target="_blank" rel="noopener noreferrer" className="group relative mx-auto block max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrder.payment.slipUrl}
                    alt="หลักฐานการโอนเงิน"
                    className="mx-auto max-h-[400px] max-w-full rounded-md border border-gray-100 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md bg-black/0 text-transparent transition group-hover:bg-black/40 group-hover:text-white">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm">ดูรูปเต็ม</span>
                  </div>
                </a>
                <p className="mt-3 text-xs text-gray-500">
                  คลิกที่รูปเพื่อดูขนาดเต็ม • อัพโหลดเมื่อ {formatDate(selectedOrder.payment.uploadedAt)}
                </p>
              </div>

              {status === "PENDING_VERIFICATION" && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div className="flex-1">
                      <div className="mb-2 font-semibold text-blue-900">คำแนะนำการตรวจสอบสลิป</div>
                      <div className="space-y-0.5 text-xs leading-relaxed text-blue-700">
                        <div>✓ ตรวจสอบจำนวนเงินให้ตรงกับยอดรวม ({formatPrice(selectedOrder.total)})</div>
                        <div>✓ ตรวจสอบวันที่และเวลาการโอนเงิน</div>
                        <div>✓ ตรวจสอบหมายเลขบัญชีปลายทาง</div>
                        <div>✓ ตรวจสอบความชัดเจนของสลิป</div>
                        <div>✓ ใช้การตรวจสอบอัตโนมัติเป็นข้อมูลเสริม</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50 p-6 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-orange-500" />
              <div className="mb-1 flex items-center justify-center gap-1.5 text-base font-medium text-orange-700">
                <AlertTriangle className="h-4 w-4" /> ไม่มีหลักฐานการโอนเงิน
              </div>
              <p className="mb-3 text-sm text-gray-500">ลูกค้ายังไม่ได้อัพโหลดสลิปการโอนเงิน</p>
              <div className="mx-auto inline-block rounded-md border border-orange-200 bg-orange-100 px-3 py-1.5 text-xs text-orange-800">
                กรุณารอให้ลูกค้าอัพโหลดสลิปการโอนเงินก่อนดำเนินการตรวจสอบ
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
