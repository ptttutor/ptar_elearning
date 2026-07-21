import { CourseCategoryClient } from "@/features/course-category/course-category-client"

export const metadata = {
  title: "คอร์ส สอวน.เคมี | เคมีพี่ต้า",
  description: "เตรียมตัวสำหรับการแข่งขันโอลิมปิกวิชาการเคมี ด้วยเนื้อหาระดับสูงและเทคนิคการแก้ปัญหาขั้นสูง",
}

export default function ChemistryOlympiadCoursePage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์ส สอวน.เคมี",
        description: "เตรียมตัวสำหรับการแข่งขันโอลิมปิกวิชาการเคมี ด้วยเนื้อหาระดับสูงและเทคนิคการแก้ปัญหาขั้นสูง",
        videoPostType: "วิดีโอแนะนำ-สอวน.เคมี",
        summaryPostType: "ภาพสรุป-สอวน.เคมี",
        videoTitle: "วิดีโอแนะนำ สอวน.เคมี",
        recommendedCategory: "คอร์ส-สอวน.เคมี",
        vimeoRich: true,
      }}
    />
  )
}
