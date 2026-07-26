import { ExamResultDetailClient } from "@/features/exam-results/exam-result-detail-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ผลการทำข้อสอบ"),
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function ExamResultDetailPage({ params }: PageProps) {
  const { attemptId } = await params
  return <ExamResultDetailClient attemptId={attemptId} />
}
