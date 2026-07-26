import { ExamBankClient } from "@/features/exam-bank/exam-bank-client"
import { fetchExams } from "@/features/exam-bank/api/fetch-exams"
import { fetchExamCategories } from "@/features/exam-bank/api/fetch-exam-categories"
import { fetchExamYears } from "@/features/exam-bank/api/fetch-exam-years"
import { fetchCanDownload } from "@/features/exam-bank/api/fetch-can-download"
import { getBaseUrl } from "@/lib/get-base-url"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คลังข้อสอบ"),
  description: "รวบรวมข้อสอบเคมีและวิชาที่เกี่ยวข้องจากหลายปีการศึกษา พร้อมให้ดูและดาวน์โหลดฟรี",
}

export default async function ExamBankPage() {
  const baseUrl = await getBaseUrl()
  const [{ items, total }, categories, years, canDownload] = await Promise.all([
    fetchExams({ page: 1, categoryId: "all", year: "all", search: "" }, baseUrl),
    fetchExamCategories(baseUrl),
    fetchExamYears(baseUrl),
    fetchCanDownload(baseUrl),
  ])

  return <ExamBankClient initialExams={items} initialTotal={total} initialCategories={categories} initialYears={years} initialCanDownload={canDownload} />
}
