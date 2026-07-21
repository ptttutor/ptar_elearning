export type OrderEbook = {
  id: string
  title: string
  author?: string | null
  coverImageUrl?: string | null
  fileUrl?: string | null
  previewUrl?: string | null
}

export type Order = {
  id: string
  orderType: "COURSE" | "EBOOK"
  status: string
  total: number
  ebook?: OrderEbook
  payment?: { status?: string | null }
  items?: Array<{ itemType?: string; itemId?: string; title?: string | null; coverImageUrl?: string | null; author?: string | null }>
}

export type PaidEbookEntry = {
  orderId: string
  ebookId: string
  title?: string | null
  coverImageUrl?: string | null
  author?: string | null
}

export type EbookMeta = {
  title?: string | null
  coverImageUrl?: string | null
  author?: string | null
  fileUrl?: string | null
}
