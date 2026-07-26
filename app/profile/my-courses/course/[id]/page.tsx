import { CoursePlayerClient } from "@/features/course-player/course-player-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("เรียนคอร์ส"),
}

type PageProps = { params: Promise<{ id: string }> }

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params
  return <CoursePlayerClient courseId={id} />
}
