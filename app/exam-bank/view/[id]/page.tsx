import { ExamViewerClient } from "@/features/exam-viewer/exam-viewer-client"

type PageProps = { params: Promise<{ id: string }> }

export default async function ExamViewerPage({ params }: PageProps) {
  const { id } = await params
  return <ExamViewerClient id={id} />
}
