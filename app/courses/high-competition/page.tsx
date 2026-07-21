import { CourseCategoryClient } from "@/features/course-category/course-category-client"

export const metadata = {
  title: "คอร์สแข่งขัน ม.ปลาย | เคมีพี่ต้า",
  description: "เตรียมสอบแข่งขันด้วยวิดีโอแนะนำและคอร์สแนะนำคุณภาพสูง",
}

export default function HighCompetitionCoursesPage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์สแข่งขัน ม.ปลาย",
        description: "เตรียมสอบแข่งขันด้วยวิดีโอแนะนำและคอร์สแนะนำคุณภาพสูง",
        videoPostType: "วิดีโอแนะนำคอร์สแข่งขัน-ม.ปลาย",
        summaryPostType: "ภาพสรุปแข่งขัน-ม.ปลาย",
        videoTitle: "วิดีโอแนะนำ คอร์สแข่งขัน ม.ปลาย",
        recommendedCategory: "คอร์สแข่งขัน",
        summaryCardBg: "background",
        endedMessage: "ชมวิดีโอตัวอย่างจบแล้ว",
      }}
    />
  )
}
