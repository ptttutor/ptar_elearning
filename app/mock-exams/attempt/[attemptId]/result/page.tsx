import { MockExamResultClient } from "@/features/mock-exam-result/mock-exam-result-client"

export const metadata = {
  title: "ผลข้อสอบจำลอง | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function MockExamResultPage({ params }: PageProps) {
  const { attemptId } = await params
  return <MockExamResultClient attemptId={attemptId} />
}
