"use client";
import { AlertTriangle, Tag, FileText, Calendar, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DeleteModal({ open, postCategory, loading, onConfirm, onCancel }) {
  if (!postCategory) return null;

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบหมวดหมู่โพสต์
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white">
              <Tag className="h-6 w-6" />
            </div>
            <div className="text-lg font-semibold text-red-600">คุณแน่ใจหรือไม่?</div>
            <div className="text-sm text-gray-500">การลบหมวดหมู่นี้จะไม่สามารถกู้คืนได้</div>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">{postCategory.name}</div>
                {postCategory.description && <div className="text-xs text-gray-500">{postCategory.description}</div>}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {postCategory.posts?.length || 0} โพสต์
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(postCategory.createdAt)}
              </span>
              <Badge
                variant="outline"
                className={postCategory.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}
              >
                {postCategory.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
              </Badge>
            </div>
          </div>

          {postCategory.posts && postCategory.posts.length > 0 && (
            <div className="flex items-start gap-1.5 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>คำเตือน:</strong> หมวดหมู่นี้มี {postCategory.posts.length} โพสต์ การลบจะส่งผลต่อโพสต์เหล่านั้น
              </span>
            </div>
          )}
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
