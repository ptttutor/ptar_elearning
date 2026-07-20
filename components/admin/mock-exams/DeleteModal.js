"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getSubjectLabel } from "@/lib/constants";

export default function DeleteModal({ open, exam, loading, onConfirm, onCancel }) {
  if (!exam) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบข้อสอบจำลอง
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="py-2">
          <p className="text-sm text-gray-700">คุณแน่ใจหรือไม่ที่จะลบข้อสอบจำลองนี้?</p>

          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
            <div>
              <span className="font-semibold">ชื่อข้อสอบ: </span>
              {exam.title}
            </div>
            <div>
              <span className="font-semibold">วิชา: </span>
              {getSubjectLabel(exam.subject)}
            </div>
            <div>
              <span className="font-semibold">จำนวนข้อ: </span>
              {exam._count?.questions || 0}
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            ข้อสอบและคำถามทั้งหมดจะถูกลบอย่างถาวร
          </p>
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
              "ลบข้อสอบจำลอง"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
