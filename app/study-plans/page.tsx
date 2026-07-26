import { StudyPlansClient } from "@/features/study-plans/study-plans-client"
import { fetchStudyPlans } from "@/features/study-plans/api/fetch-study-plans"
import { pageTitle, siteConfig } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("แผนการเรียน"),
  description: `แผนการเรียนเคมีสำหรับนักเรียน${siteConfig.fullName}`,
}

export default async function StudyPlansPage() {
  const items = await fetchStudyPlans()
  return <StudyPlansClient items={items} />
}
