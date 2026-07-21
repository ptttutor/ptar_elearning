import { ExamAttemptClient } from "@/features/exam-attempt/exam-attempt-client"

export const metadata = {
  title: "ทำข้อสอบ | เคมีพี่ต้า",
}

type PageProps = { params: Promise<{ id: string; examId: string }> }

export default async function ExamAttemptPage({ params }: PageProps) {
  const { id, examId } = await params
  return <ExamAttemptClient courseId={id} examId={examId} />
}
