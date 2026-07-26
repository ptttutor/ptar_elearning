import { CourseCategoryClient } from "@/features/course-category/course-category-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์สเคมี NETSAT"),
  description: "เตรียมความพร้อมสำหรับการสอบ NETSAT เคมี ด้วยเนื้อหาที่ครอบคลุมและเทคนิคการทำข้อสอบ",
}

export default function NetsatCoursePage() {
  return (
    <CourseCategoryClient
      config={{
        title: "คอร์สเคมี NETSAT",
        description: "เตรียมความพร้อมสำหรับการสอบ NETSAT เคมี ด้วยเนื้อหาที่ครอบคลุมและเทคนิคการทำข้อสอบ",
        videoPostType: "วิดีโอแนะนำ-NETSAT",
        summaryPostType: "ภาพสรุป-NETSAT",
        videoTitle: "วิดีโอแนะนำ NETSAT",
        recommendedCategory: "คอร์ส-เคมีNETSAT",
        vimeoRich: true,
      }}
    />
  )
}
