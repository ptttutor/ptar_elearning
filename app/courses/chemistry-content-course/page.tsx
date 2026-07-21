import { CourseCategoryClient } from "@/features/course-category/course-category-client"

export const metadata = {
  title: "คอร์ส เนื้อหาเคมี | เคมีพี่ต้า",
  description: "เรียนเนื้อหาเคมีอย่างครบถ้วน เพื่อเก็บเกรดในโรงเรียนและเตรียมตัวสอบเข้ามหาวิทยาลัย",
}

export default function ChemistryContentCoursePage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์ส เนื้อหาเคมี",
        description: "เรียนเนื้อหาเคมีอย่างครบถ้วน เพื่อเก็บเกรดในโรงเรียนและเตรียมตัวสอบเข้ามหาวิทยาลัย",
        videoPostType: "วิดีโอแนะนำ-เนื้อหาเคมี",
        summaryPostType: "ภาพสรุป-เนื้อหาเคมี",
        videoTitle: "วิดีโอแนะนำ เนื้อหาเคมี",
        recommendedCategory: "คอร์ส-เนื้อหาเคมี",
        vimeoRich: true,
      }}
    />
  )
}
