import { CourseCategoryClient } from "@/features/course-category/course-category-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์ส ม.ต้น"),
  description: "เลือกคอร์สที่เหมาะกับระดับ ม.ต้น พร้อมวิดีโอแนะนำและเนื้อหาคุณภาพสูง",
}

export default function MiddleCoursesPage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์ส ม.ต้น",
        description: "เลือกคอร์สที่เหมาะกับระดับ ม.ต้น พร้อมวิดีโอแนะนำและเนื้อหาคุณภาพสูง",
        videoPostType: "วิดีโอแนะนำ-ม.ต้น",
        summaryPostType: "ภาพสรุป-ม.ต้น",
        videoTitle: "วิดีโอแนะนำ ม.ต้น",
        recommendedCategory: "ม.ต้น",
      }}
    />
  )
}
