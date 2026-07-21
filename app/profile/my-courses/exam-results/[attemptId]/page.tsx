import { ExamResultDetailClient } from "@/features/exam-results/exam-result-detail-client"

export const metadata = {
  title: "ผลการทำข้อสอบ | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function ExamResultDetailPage({ params }: PageProps) {
  const { attemptId } = await params
  return <ExamResultDetailClient attemptId={attemptId} />
}
