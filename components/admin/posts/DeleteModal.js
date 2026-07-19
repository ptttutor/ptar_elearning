"use client";
import { AlertTriangle, FileText, Star, Loader2 } from "lucide-react";
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

export default function DeleteModal({ open, post, loading, onConfirm, onCancel }) {
  if (!post) return null;

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString("th-TH") : "-");

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ยืนยันการลบโพสต์
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-gray-500">
                {post.imageUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-gray-900">{post.title}</span>
                  {post.isFeatured && (
                    <Badge variant="outline" className="shrink-0 gap-1 border-amber-200 bg-amber-50 text-amber-700">
                      <Star className="h-3 w-3" /> แนะนำ
                    </Badge>
                  )}
                </div>
                {post.excerpt && (
                  <div className="truncate text-xs text-gray-500">
                    {post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <span className="font-medium text-gray-700">ประเภท: </span>
                {post.postType?.name || "ไม่ระบุ"}
              </div>
              <div>
                <span className="font-medium text-gray-700">ผู้เขียน: </span>
                {post.author?.name || "ไม่ระบุ"}
              </div>
              <div>
                <span className="font-medium text-gray-700">สถานะ: </span>
                <Badge
                  variant="outline"
                  className={post.isActive ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}
                >
                  {post.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-gray-700">วันที่สร้าง: </span>
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-red-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>การดำเนินการนี้ไม่สามารถยกเลิกได้</span>
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
              "ลบโพสต์"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
