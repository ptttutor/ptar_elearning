import { MockExamDetailClient } from "@/features/mock-exam-detail/mock-exam-detail-client"
import { fetchMockExamById } from "@/features/mock-exam-detail/api/mock-exam"
import { getBaseUrl } from "@/lib/get-base-url"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const exam = await fetchMockExamById(id, baseUrl).catch(() => null)

  if (!exam) {
    return { title: "ไม่พบข้อสอบจำลองนี้ | เคมีพี่ต้า" }
  }

  return {
    title: `${exam.title} | เคมีพี่ต้า`,
    description: exam.description?.slice(0, 160) || `ข้อสอบจำลอง ${exam.title}`,
  }
}

export default async function MockExamDetailPage({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const exam = await fetchMockExamById(id, baseUrl).catch(() => null)

  return <MockExamDetailClient id={id} initial={exam} />
}
