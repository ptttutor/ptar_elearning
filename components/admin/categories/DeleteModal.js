"use client";
import { AlertTriangle, Layers, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteModal({ open, category, loading, onConfirm, onCancel }) {
  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบหมวดหมู่
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 rounded-md border border-orange-200 bg-orange-50 p-3">
            <Layers className="h-5 w-5 shrink-0 text-orange-500" />
            <div>
              <div className="font-semibold text-gray-900">{category.name}</div>
              {category.description && <div className="text-sm text-gray-500">{category.description}</div>}
            </div>
          </div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold text-red-600">คำเตือน:</span> การลบหมวดหมู่นี้ไม่สามารถยกเลิกได้
            กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
          </p>

          <p className="text-sm text-gray-700">
            คุณต้องการลบหมวดหมู่ &quot;<span className="font-semibold text-red-600">{category.name}</span>&quot; ใช่หรือไม่?
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
              "ลบหมวดหมู่"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
