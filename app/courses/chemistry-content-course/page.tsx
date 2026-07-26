import { CourseCategoryClient } from "@/features/course-category/course-category-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์ส เนื้อหาเคมี"),
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
