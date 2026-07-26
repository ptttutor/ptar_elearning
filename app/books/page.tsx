import { BooksListClient } from "@/features/books-list/books-list-client"
import { fetchAllEbooks, fetchBookCategories } from "@/features/books-list/api/fetch-books"
import { getBaseUrl } from "@/lib/get-base-url"
import { pageTitle } from "@/lib/site-config"

export const metadata = {
  title: pageTitle("หนังสือทั้งหมด"),
  description: "เลือกดูหนังสือเรียนเคมีทั้งหมด และกรองตามหมวดหมู่",
}

export default async function AllBooksPage() {
  const baseUrl = await getBaseUrl()
  const [ebooks, categories] = await Promise.all([fetchAllEbooks(baseUrl), fetchBookCategories(baseUrl)])

  return <BooksListClient initialEbooks={ebooks} initialCategories={categories} />
}
