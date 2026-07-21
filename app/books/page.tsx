import { BooksListClient } from "@/features/books-list/books-list-client"
import { fetchAllEbooks, fetchBookCategories } from "@/features/books-list/api/fetch-books"
import { getBaseUrl } from "@/lib/get-base-url"

export const metadata = {
  title: "หนังสือทั้งหมด | เคมีพี่ต้า",
  description: "เลือกดูหนังสือเรียนเคมีทั้งหมด และกรองตามหมวดหมู่",
}

export default async function AllBooksPage() {
  const baseUrl = await getBaseUrl()
  const [ebooks, categories] = await Promise.all([fetchAllEbooks(baseUrl), fetchBookCategories(baseUrl)])

  return <BooksListClient initialEbooks={ebooks} initialCategories={categories} />
}
