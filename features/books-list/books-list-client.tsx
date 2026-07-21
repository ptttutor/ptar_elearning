"use client"

import { useRouter } from "next/navigation"
import { useBooksList } from "@/features/books-list/hooks/use-books-list"
import { CategoryFilter } from "@/features/books-list/components/category-filter"
import { BookCard } from "@/features/books-list/components/book-card"
import { BookGridSkeleton } from "@/features/books-list/components/book-grid-skeleton"
import { PaginationControls } from "@/features/books-list/components/pagination-controls"
import type { BookCategory, Ebook } from "@/features/books-list/types"

export function BooksListClient({ initialEbooks, initialCategories }: { initialEbooks: Ebook[]; initialCategories: BookCategory[] }) {
  const router = useRouter()

  const { categories, selectedCategory, onSelectCategory, loading, error, ebooks, paginatedBooks, currentPage, setCurrentPage, totalPages } = useBooksList({
    initialEbooks,
    initialCategories,
  })

  const handleDetails = (ebookId: string) => router.push(`/books/${encodeURIComponent(ebookId)}`)

  return (
    <section className="pt-10 pb-10 lg:pt-16 lg:pb-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">หนังสือทั้งหมด</h1>
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto text-pretty">เลือกดูหนังสือเรียนฟิสิกส์ทั้งหมด และกรองตามหมวดหมู่</p>
        </div>

        <CategoryFilter categories={categories} value={selectedCategory} onChange={onSelectCategory} />

        {loading && <BookGridSkeleton />}
        {!loading && error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && ebooks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} onViewDetails={handleDetails} />
            ))}
          </div>
        )}

        {!loading && !error && ebooks.length === 0 && <div className="text-center text-gray-500 py-12">ไม่พบหนังสือในหมวดหมู่นี้</div>}

        {!loading && !error && ebooks.length > 0 && (
          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-2">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </section>
  )
}
