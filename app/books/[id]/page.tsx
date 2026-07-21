import { BookDetailClient } from "@/features/book-detail/book-detail-client"
import { fetchBookById } from "@/features/book-detail/api/fetch-book"
import { getBaseUrl } from "@/lib/get-base-url"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const book = await fetchBookById(id, baseUrl).catch(() => null)

  if (!book) {
    return { title: "ไม่พบหนังสือนี้ | เคมีพี่ต้า" }
  }

  return {
    title: `${book.title} | เคมีพี่ต้า`,
    description: book.description?.slice(0, 160) || `หนังสือ ${book.title}`,
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160),
      images: book.coverImageUrl ? [book.coverImageUrl] : undefined,
    },
  }
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params
  const baseUrl = await getBaseUrl()
  const book = await fetchBookById(id, baseUrl).catch(() => null)

  return <BookDetailClient id={id} initial={book} />
}
