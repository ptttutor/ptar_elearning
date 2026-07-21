import { StudentWorksClient } from "@/features/student-works/student-works-client"
import { fetchStudentWorks } from "@/features/student-works/api/fetch-student-works"

export const metadata = {
  title: "ผลงานนักเรียน | เคมีพี่ต้า",
  description: "ผลงานและความสำเร็จของนักเรียนโรงเรียนกวดวิชาเคมีพี่ต้า",
}

export default async function StudentWorksPage() {
  const items = await fetchStudentWorks()
  return <StudentWorksClient items={items} />
}
