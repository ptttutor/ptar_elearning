import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/features/book-detail/components/star-rating"
import type { Ebook } from "@/features/book-detail/types"

const getYear = (iso?: string | null) => {
  if (!iso) return "-"
  try {
    const d = new Date(iso)
    return isNaN(d.getTime()) ? "-" : d.getFullYear()
  } catch {
    return "-"
  }
}

export function BookHero({ book, averageRating, totalReviews }: { book: Ebook; averageRating: number; totalReviews: number }) {
  return (
    <section className="order-1 lg:order-1 lg:col-span-2 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white">
          <Image src={book.coverImageUrl || "/placeholder.svg?height=600&width=450"} alt={book.title} fill className="object-contain" />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {book.category?.name && <Badge className="rounded-full bg-blue-400 text-white px-3 py-1 h-7">{book.category.name}</Badge>}
            {book.format && (
              <Badge variant="outline" className="rounded-full h-7 px-3">
                รูปแบบ: {book.format}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight text-balance">{book.title}</h1>

          <div className="text-gray-700">
            <span className="font-medium">ผู้เขียน:</span> {book.author || "ไม่ระบุผู้เขียน"}
          </div>

          <div className="flex items-center gap-2">
            <StarRating value={averageRating || 0} readOnly />
            <span className="text-sm text-gray-600">
              {averageRating?.toFixed(1) ?? "0.0"} ({totalReviews} รีวิว)
            </span>
          </div>

          {book.description && <p className="text-gray-700 leading-relaxed text-pretty">{book.description}</p>}

          <div className="grid grid-cols-2 gap-3 text-sm pt-2">
            <div>
              <span className="text-gray-500">ISBN:</span> <span className="font-medium">{book.isbn || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">ปีที่ตีพิมพ์:</span> <span className="font-medium">{getYear(book.publishedAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">จำนวนหน้า:</span> <span className="font-medium">{book.pageCount ?? "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">ภาษา:</span> <span className="font-medium">{book.language || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
