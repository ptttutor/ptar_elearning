import { MockExamResultClient } from "@/features/mock-exam-result/mock-exam-result-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ผลข้อสอบจำลอง"),
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function MockExamResultPage({ params }: PageProps) {
  const { attemptId } = await params
  return <MockExamResultClient attemptId={attemptId} />
}
