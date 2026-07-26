import { ExamAttemptClient } from "@/features/exam-attempt/exam-attempt-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ทำข้อสอบ"),
}

type PageProps = { params: Promise<{ id: string; examId: string }> }

export default async function ExamAttemptPage({ params }: PageProps) {
  const { id, examId } = await params
  return <ExamAttemptClient courseId={id} examId={examId} />
}
