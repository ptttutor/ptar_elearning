import { CoursePlayerClient } from "@/features/course-player/course-player-client"

export const metadata = {
  title: "เรียนคอร์ส | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params
  return <CoursePlayerClient courseId={id} />
}
