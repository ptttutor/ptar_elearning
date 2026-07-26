import { ExamResultsListClient } from "@/features/exam-results/exam-results-list-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("ประวัติการทำข้อสอบ"),
}

export default function ExamResultsPage() {
  return <ExamResultsListClient />
}
