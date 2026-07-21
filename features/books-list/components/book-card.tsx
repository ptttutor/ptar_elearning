import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Ebook } from "@/features/books-list/types"

export function BookCard({ book, onViewDetails }: { book: Ebook; onViewDetails: (id: string) => void }) {
  const hasDiscount = (book.discountPrice || 0) > 0 && book.discountPrice < book.price
  const percent = hasDiscount ? Math.round(((book.price - book.discountPrice) / book.price) * 100) : 0

  return (
    <Card className="overflow-hidden group py-0">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] bg-white">
          <Image src={book.coverImageUrl || "/placeholder.svg?height=200&width=350"} alt={book.title} fill className="object-cover transition-transform duration-300 hover:object-contain group-hover:scale-105" />
          {hasDiscount && <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{percent}%</Badge>}
        </div>
        <div className="p-4 space-y-3">
          <div className="font-semibold text-gray-900 line-clamp-2">{book.title}</div>
          <div className="text-sm text-gray-600">{book.author || "ไม่ระบุผู้เขียน"}</div>
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <div className="text-lg font-bold text-blue-600">฿{book.discountPrice.toLocaleString()}</div>
                <div className="text-sm text-gray-500 line-through">฿{book.price.toLocaleString()}</div>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-900">฿{book.price.toLocaleString()}</div>
            )}
          </div>
          <div className="pt-1">
            <Button className="bg-blue-400 hover:bg-blue-500 text-white w-full" onClick={() => onViewDetails(book.id)}>
              ดูรายละเอียด
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
