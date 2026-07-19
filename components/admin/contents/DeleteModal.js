"use client";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteModal({ open, content, loading, onConfirm, onCancel }) {
  if (!content) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบเนื้อหา
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            คำเตือน: การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>

          <p className="text-sm text-gray-700">คุณต้องการลบเนื้อหาต่อไปนี้:</p>

          <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
            <div>
              <div className="text-gray-500">ชื่อเนื้อหา:</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-blue-600" />
                {content.title}
              </div>
            </div>
            <div>
              <div className="text-gray-500">ประเภท:</div>
              <div>{content.contentType}</div>
            </div>
            <div>
              <div className="text-gray-500">URL/ไฟล์:</div>
              <div className="break-all text-xs">{content.contentUrl}</div>
            </div>
          </div>

          <p className="text-xs text-gray-400">เนื้อหานี้จะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              "ลบเนื้อหา"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
