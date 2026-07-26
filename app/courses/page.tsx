import { CoursesListClient } from "@/features/courses-list/courses-list-client"
import { fetchCourses, fetchSubjectOptions, PAGE_SIZE } from "@/features/courses-list/api/fetch-courses"
import { getBaseUrl } from "@/lib/get-base-url"
import { pageTitle, siteConfig } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์สเรียนทั้งหมด"),
  description: `เลือกคอร์สเรียนเคมีที่เหมาะกับเป้าหมายของคุณ เรียนกับต้า${siteConfig.siteName}ผู้เชี่ยวชาญ`,
}

type PageProps = { searchParams: Promise<{ gradeLevel?: string }> }

export default async function CoursesPage({ searchParams }: PageProps) {
  const { gradeLevel } = await searchParams
  const initialGradeLevel = gradeLevel || "all"

  const baseUrl = await getBaseUrl()
  const params = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE) })
  if (initialGradeLevel !== "all") params.set("gradeLevel", initialGradeLevel)

  const [coursesJson, subjects] = await Promise.all([fetchCourses(params, baseUrl), fetchSubjectOptions(baseUrl)])

  return (
    <CoursesListClient
      initialGradeLevel={initialGradeLevel}
      initialCourses={Array.isArray(coursesJson?.data) ? coursesJson.data : []}
      initialTotal={coursesJson?.pagination?.total ?? 0}
      initialTotalPages={coursesJson?.pagination?.totalPages ?? 1}
      initialSubjects={subjects}
    />
  )
}
