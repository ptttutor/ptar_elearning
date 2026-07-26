import { MyCoursesPageClient } from "@/features/profile-my-courses/my-courses-page-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("คอร์สของฉัน"),
}

export default function MyCoursesPage() {
  return <MyCoursesPageClient />
}
