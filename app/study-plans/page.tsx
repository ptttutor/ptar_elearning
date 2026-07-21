import { StudyPlansClient } from "@/features/study-plans/study-plans-client"
import { fetchStudyPlans } from "@/features/study-plans/api/fetch-study-plans"

export const metadata = {
  title: "แผนการเรียน | เคมีพี่ต้า",
  description: "แผนการเรียนเคมีสำหรับนักเรียนโรงเรียนกวดวิชาเคมีพี่ต้า",
}

export default async function StudyPlansPage() {
  const items = await fetchStudyPlans()
  return <StudyPlansClient items={items} />
}
