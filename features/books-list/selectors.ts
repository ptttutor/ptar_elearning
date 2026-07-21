import type { BookCategory, Ebook } from "@/features/books-list/types"

export function filterByCategory(categoryId: string, source: Ebook[], categories: BookCategory[]): Ebook[] {
  if (!Array.isArray(source) || source.length === 0) return categoryId === "all" ? source : []
  if (categoryId === "all") return source

  const selected = categories.find((c) => c.id === categoryId)
  const slug = selected?.slug?.trim()
  const name = selected?.name?.trim()
  const id = selected?.id ? String(selected.id) : undefined

  return source.filter((ebook) => {
    const cat = ebook.category
    const fallbackName = ebook.categoryName
    const fallbackSlug = ebook.categorySlug
    const fallbackId = ebook.categoryId
    const catSlug = cat?.slug?.trim()
    const catName = cat?.name?.trim()
    const catId = cat?.id ? String(cat.id) : undefined
    return (
      (slug && catSlug === slug) ||
      (slug && fallbackSlug && fallbackSlug === slug) ||
      (id && catId === id) ||
      (id && fallbackId && String(fallbackId) === id) ||
      (name && catName === name) ||
      (name && fallbackName && fallbackName === name)
    )
  })
}
