import { CourseDetailClient } from "@/features/course-detail/course-detail-client"
import { fetchCourseDetail } from "@/features/course-detail/api/fetch-course"
import { getBaseUrl } from "@/lib/get-base-url"
import { siteConfig } from "@/lib/site-config"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const { course } = await fetchCourseDetail(id, baseUrl)

  if (!course) {
    return { title: `ไม่พบคอร์สนี้ | ${siteConfig.siteName}` }
  }

  return {
    title: `${course.title} | ${siteConfig.siteName}`,
    description: course.description?.slice(0, 160) || `คอร์สเรียน ${course.title} กับ${siteConfig.siteName}`,
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
