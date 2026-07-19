"use client";
import { BookOpen, Book, DollarSign, User, Tag, FileText, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductInfoCard({ selectedOrder, formatPrice }) {
  const productTitle =
    selectedOrder.items && selectedOrder.items.length > 0
      ? selectedOrder.items[0].title
      : selectedOrder.ebook?.title || selectedOrder.course?.title || "ไม่ระบุชื่อสินค้า";

  const coverImage = selectedOrder.ebook?.coverImageUrl || selectedOrder.course?.coverImageUrl;

  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        {selectedOrder.orderType === "EBOOK" ? <Book className="h-4 w-4 text-blue-600" /> : <BookOpen className="h-4 w-4 text-blue-600" />}
        ข้อมูลสินค้า: {productTitle}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-100 text-gray-400">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={productTitle} className="h-full w-full object-cover" />
          ) : selectedOrder.orderType === "EBOOK" ? (
            <Book className="h-8 w-8" />
          ) : (
            <BookOpen className="h-8 w-8" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="mb-3 text-lg font-semibold text-gray-900">{productTitle}</h4>

          {(selectedOrder.course?.description || selectedOrder.ebook?.description) && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-500">
              {selectedOrder.course?.description || selectedOrder.ebook?.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-blue-600" />
                ประเภท: {selectedOrder.orderType === "EBOOK" ? "หนังสือ" : "คอร์ส"}
              </span>
              {selectedOrder.ebook?.author && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  ผู้แต่ง: {selectedOrder.ebook.author}
                </span>
              )}
              {selectedOrder.course?.instructor && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  อาจารย์: {selectedOrder.course.instructor.name}
                </span>
              )}
            </div>

            {selectedOrder.ebook && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {selectedOrder.ebook.pageCount && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    จำนวนหน้า: {selectedOrder.ebook.pageCount} หน้า
                  </span>
                )}
                {selectedOrder.ebook.language && <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">{selectedOrder.ebook.language}</Badge>}
                {selectedOrder.ebook.format && <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">{selectedOrder.ebook.format}</Badge>}
                {selectedOrder.ebook.category && (
                  <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                    <Tag className="h-3 w-3" /> {selectedOrder.ebook.category.name}
                  </Badge>
                )}
              </div>
            )}

            {selectedOrder.course && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.course.category && (
                  <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                    <Tag className="h-3 w-3" /> {selectedOrder.course.category.name}
                  </Badge>
                )}
                {selectedOrder.course.isFree && (
                  <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
                    <PlayCircle className="h-3 w-3" /> คอร์สฟรี
                  </Badge>
                )}
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">รายละเอียดเพิ่มเติมด้านล่าง</Badge>
              </div>
            )}

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                <span className="text-xl font-bold text-emerald-600">{formatPrice(selectedOrder.total)}</span>
                {(selectedOrder.course?.discountPrice || selectedOrder.ebook?.discountPrice) && (
                  <>
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      {formatPrice(selectedOrder.course?.price || selectedOrder.ebook?.price)}
                    </span>
                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">ลดราคา</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
