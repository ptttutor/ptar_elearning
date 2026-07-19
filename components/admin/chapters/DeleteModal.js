"use client";
import { AlertTriangle, BookOpen, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteModal({ open, chapter, loading, onConfirm, onCancel }) {
  if (!chapter) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบ Chapter
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            คำเตือน: การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>

          <p className="text-sm text-gray-700">คุณต้องการลบ Chapter ต่อไปนี้:</p>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
            <div className="text-gray-500">ชื่อ Chapter:</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-semibold text-gray-900">
              <BookOpen className="h-4 w-4 text-blue-600" />
              {chapter.title}
            </div>
            <div className="mt-2 text-gray-500">ลำดับ:</div>
            <div>Chapter {chapter.order}</div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            การลบ Chapter จะลบเนื้อหาทั้งหมดใน Chapter นี้ด้วย
          </div>

          <p className="text-xs text-gray-400">Chapter นี้จะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้</p>
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
              "ลบ Chapter"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
