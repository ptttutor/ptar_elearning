import { MockExamsListClient } from "@/features/mock-exams-list/mock-exams-list-client"
import { fetchMockExams } from "@/features/mock-exams-list/api/fetch-mock-exams"
import { getBaseUrl } from "@/lib/get-base-url"

export const metadata = {
  title: "ระบบจำลองสอบ | เคมีพี่ต้า",
  description: "ฝึกทำโจทย์แบบไม่จับเวลา หรือจำลองสถานการณ์สอบจริงแบบจับเวลา ก่อนลงสนามจริง",
}

export default async function MockExamsPage() {
  const baseUrl = await getBaseUrl()
  const json = await fetchMockExams({ page: 1, subject: "all", gradeLevel: "all" }, baseUrl)

  return <MockExamsListClient initialExams={json?.data ?? []} initialTotal={json?.pagination?.total ?? 0} initialTotalPages={json?.pagination?.totalPages ?? 1} />
}
