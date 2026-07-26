import { CourseCategoryClient } from "@/features/course-category/course-category-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์ส ม.ปลาย"),
  description: "วิดีโอแนะนำและคอร์สแนะนำสำหรับ ม.ปลาย",
}

export default function HighCoursesPage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์ส ม.ปลาย",
        description: "วิดีโอแนะนำและคอร์สแนะนำสำหรับ ม.ปลาย",
        videoPostType: "วิดีโอแนะนำ-ม.ปลาย",
        summaryPostType: "ภาพสรุป-ม.ปลาย",
        videoTitle: "วิดีโอแนะนำ ม.ปลาย",
        recommendedCategory: "ม.ปลาย",
        endedMessage: "ชมวิดีโอตัวอย่างจบแล้ว",
      }}
    />
  )
}
