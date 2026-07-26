import { StudentWorksClient } from "@/features/student-works/student-works-client"
import { fetchStudentWorks } from "@/features/student-works/api/fetch-student-works"
import { pageTitle, siteConfig } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ผลงานนักเรียน"),
  description: `ผลงานและความสำเร็จของนักเรียน${siteConfig.fullName}`,
}

export default async function StudentWorksPage() {
  const items = await fetchStudentWorks()
  return <StudentWorksClient items={items} />
}
