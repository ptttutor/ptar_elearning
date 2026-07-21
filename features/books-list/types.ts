export type Ebook = {
  id: string
  title: string
  description?: string | null
  author?: string | null
  price: number
  discountPrice: number
  coverImageUrl?: string | null
  averageRating?: number
  isPhysical?: boolean
  category?: { id: string; name?: string | null; slug?: string | null } | null
  categoryName?: string
  categorySlug?: string
  categoryId?: string | number
}

export type BookCategory = { id: string; name: string; slug: string }
