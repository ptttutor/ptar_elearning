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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function DeleteModal({ open, user, loading, onConfirm, onCancel }) {
  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบผู้ใช้
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="py-2">
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>คำเตือนระดับสูง:</strong> การดำเนินการนี้ไม่สามารถย้อนกลับได้
            และอาจทำให้ข้อมูลที่เกี่ยวข้องหายทั้งหมด
          </div>

          <div className="mb-5 flex flex-col items-center text-center">
            <Avatar className="mb-3 h-16 w-16">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="bg-red-500 text-lg text-white">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-lg font-semibold text-gray-900">
              {user.name || "ไม่ระบุชื่อ"}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>

          <div className="text-center text-sm text-gray-700">
            คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้ <strong>&quot;{user.name || user.email}&quot;</strong>?
            <div className="mt-1 text-xs text-gray-400">
              ข้อมูลทั้งหมดของผู้ใช้จะถูกลบออกจากระบบอย่างถาวร
            </div>
          </div>

          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <strong>ข้อมูลที่จะถูกลบ:</strong>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>ข้อมูลผู้ใช้และโปรไฟล์</li>
              <li>ประวัติการเรียน (หากมี)</li>
              <li>คำสั่งซื้อและข้อมูลการชำระเงินที่เกี่ยวข้อง (หากมี)</li>
              <li>คอร์ส/ข้อสอบ/เนื้อหา ที่ผู้ใช้นี้เป็นผู้สอน พร้อมข้อมูลผู้เรียนที่เกี่ยวข้อง</li>
            </ul>
          </div>
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
              "ลบผู้ใช้"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
