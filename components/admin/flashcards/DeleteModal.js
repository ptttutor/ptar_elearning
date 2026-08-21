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

export default function DeleteModal({ open, card, loading, onConfirm, onCancel }) {
  if (!card) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบการ์ด
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="py-2">
          <p className="text-sm text-gray-700">คุณแน่ใจหรือไม่ที่จะลบการ์ดใบนี้?</p>
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
            <span className="font-semibold">คำถาม: </span>
            {card.front}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            หากมีนักเรียนทบทวนการ์ดนี้ไปแล้ว ระบบจะลบไม่ได้
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
              "ลบการ์ด"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
