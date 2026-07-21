import { CourseDetailClient } from "@/features/course-detail/course-detail-client"
import { fetchCourseDetail } from "@/features/course-detail/api/fetch-course"
import { getBaseUrl } from "@/lib/get-base-url"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const { course } = await fetchCourseDetail(id, baseUrl)

  if (!course) {
    return { title: "ไม่พบคอร์สนี้ | เคมีพี่ต้า" }
  }

  return {
    title: `${course.title} | เคมีพี่ต้า`,
    description: course.description?.slice(0, 160) || `คอร์สเรียน ${course.title} กับเคมีพี่ต้า`,
    openGraph: {
      title: course.title,
      description: course.description?.slice(0, 160),
      images: course.coverImageUrl ? [course.coverImageUrl] : undefined,
    },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const initial = await fetchCourseDetail(id, baseUrl)

  return <CourseDetailClient id={id} initial={initial} />
}
