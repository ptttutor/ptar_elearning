"use client";
import { Save, Undo2, RotateCcw, AlertTriangle, Move, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderActions({
  hasUnsavedChanges,
  savingOrder,
  initialOrderLength,
  onSaveOrder,
  onCancelOrder,
  onResetOrder,
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {hasUnsavedChanges && (
          <>
            <Button onClick={onSaveOrder} disabled={savingOrder} className="bg-green-600 hover:bg-green-700">
              {savingOrder ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              บันทึกการเปลี่ยนแปลงลำดับ
            </Button>
            <Button variant="outline" onClick={onCancelOrder}>
              <Undo2 className="mr-2 h-4 w-4" />
              ยกเลิก
            </Button>
          </>
        )}

        <Button
          variant="outline"
          onClick={onResetOrder}
          disabled={initialOrderLength === 0 || hasUnsavedChanges}
          title="รีเซ็ตลำดับกลับไปเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          รีเซ็ตลำดับ
        </Button>
      </div>

      <div
        className={`mt-3 flex items-center gap-1.5 rounded-md border p-3 text-sm ${
          hasUnsavedChanges
            ? "border-orange-200 bg-orange-50 text-orange-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {hasUnsavedChanges ? (
          <>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก!</strong> กรุณาคลิกบันทึกการเปลี่ยนแปลงลำดับ เพื่อยืนยัน
            </span>
          </>
        ) : (
          <>
            <Move className="h-4 w-4 shrink-0" />
            <span>
              <strong>วิธีใช้:</strong> คลิกและลากที่กล่องสีฟ้า เพื่อเรียงลำดับ Chapter (ลากอย่างน้อย 8px)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
