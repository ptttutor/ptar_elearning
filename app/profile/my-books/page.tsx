import { MyBooksPageClient } from "@/features/profile-my-books/my-books-page-client"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("หนังสือของฉัน"),
}

export default function MyBooksPage() {
  return <MyBooksPageClient />
}
