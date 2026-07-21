import { CourseCategoryClient } from "@/features/course-category/course-category-client"

export const metadata = {
  title: "คอร์ส ม.ปลาย | เคมีพี่ต้า",
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
