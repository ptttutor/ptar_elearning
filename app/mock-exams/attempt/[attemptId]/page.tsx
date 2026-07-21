import { MockExamAttemptClient } from "@/features/mock-exam-attempt/mock-exam-attempt-client"

export const metadata = {
  title: "กำลังทำข้อสอบ | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ attemptId: string }> }

export default async function MockExamAttemptPage({ params }: PageProps) {
  const { attemptId } = await params
  return <MockExamAttemptClient attemptId={attemptId} />
}
