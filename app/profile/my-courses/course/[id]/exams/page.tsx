import { CourseExamsClient } from "@/features/course-exams/course-exams-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ข้อสอบของคอร์ส"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CourseExamsPage({ params }: PageProps) {
  const { id } = await params
  return <CourseExamsClient courseId={id} />
}
