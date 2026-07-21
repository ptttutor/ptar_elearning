import { CourseExamsClient } from "@/features/course-exams/course-exams-client"

export const metadata = {
  title: "ข้อสอบของคอร์ส | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CourseExamsPage({ params }: PageProps) {
  const { id } = await params
  return <CourseExamsClient courseId={id} />
}
