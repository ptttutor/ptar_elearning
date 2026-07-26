import { MockExamAttemptClient } from "@/features/mock-exam-attempt/mock-exam-attempt-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("กำลังทำข้อสอบ"),
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function MockExamAttemptPage({ params }: PageProps) {
  const { attemptId } = await params
  return <MockExamAttemptClient attemptId={attemptId} />
}
