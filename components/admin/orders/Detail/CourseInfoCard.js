"use client";
import { BookOpen, User, Clock, FileText, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CourseInfoCard({ selectedOrder, formatPrice }) {
  const course = selectedOrder?.course;

  const courseTitle =
    selectedOrder.items && selectedOrder.items.length > 0
      ? selectedOrder.items.find((item) => item.itemType === "COURSE")?.title || course?.title
      : course?.title;

  if (!course) return null;

  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <BookOpen className="h-4 w-4 text-blue-600" />
        รายละเอียดคอร์ส: {courseTitle}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {course.description && (
          <div className="sm:col-span-2">
            <div className="mb-1 text-xs text-gray-500">คำอธิบาย</div>
            <div className="text-sm text-gray-700">{course.description}</div>
          </div>
        )}

        <div>
          <div className="mb-1 text-xs text-gray-500">อาจารย์ผู้สอน</div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-500">
              {course.instructor?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.instructor.image} alt={course.instructor?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="text-sm text-gray-700">{course.instructor?.name}</span>
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-gray-500">หมวดหมู่</div>
          {course.category ? (
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{course.category.name}</Badge>
          ) : (
            <span className="text-sm text-gray-400">ไม่ระบุ</span>
          )}
        </div>

        {course.duration && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 text-emerald-600" /> ระยะเวลา
            </div>
            <div className="text-sm text-gray-700">{course.duration} นาที</div>
          </div>
        )}

        {course.accessDuration && (
          <div>
            <div className="mb-1 text-xs text-gray-500">ระยะเวลาเข้าถึง</div>
            <div className="text-sm text-gray-700">{course.accessDuration} วัน</div>
          </div>
        )}

        <div>
          <div className="mb-1 text-xs text-gray-500">ราคา</div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-emerald-600">{formatPrice(course.price)}</span>
            {course.discountPrice && course.discountPrice < course.price && (
              <>
                <span className="text-sm text-gray-400 line-through">{formatPrice(course.price)}</span>
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">ลดราคา</Badge>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-gray-500">สถานะ</div>
          <Badge
            variant="outline"
            className={
              course.status === "PUBLISHED"
                ? "border-green-200 bg-green-50 text-green-700"
                : course.status === "DRAFT"
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          >
            {course.status === "PUBLISHED" ? "เผยแพร่แล้ว" : course.status === "DRAFT" ? "แบบร่าง" : course.status}
          </Badge>
        </div>

        {course.chapters && course.chapters.length > 0 && (
          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5 text-emerald-600" /> จำนวนบทเรียน
            </div>
            <div className="text-sm text-gray-700">{course.chapters.length} บท</div>
          </div>
        )}

        {course.isFree && (
          <div className="sm:col-span-2">
            <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
              <PlayCircle className="h-3 w-3" /> คอร์สฟรี
            </Badge>
          </div>
        )}
      </div>

      {course.chapters && course.chapters.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-blue-600" />
            รายการบทเรียน
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {course.chapters.map((chapter, index) => (
              <div key={chapter.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start gap-2">
                  <span className="min-w-[24px] text-sm font-semibold text-blue-600">{chapter.order || index + 1}.</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{chapter.title}</div>
                    {chapter.description && <div className="mt-1 text-xs text-gray-500">{chapter.description}</div>}
                    {chapter.contents && chapter.contents.length > 0 && (
                      <div className="mt-1.5 text-xs text-gray-400">เนื้อหา: {chapter.contents.length} รายการ</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
