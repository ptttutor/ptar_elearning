export type OrderListItem = {
  id?: string
  itemType?: string
  itemId?: string
  title?: string | null
  quantity?: number | null
  unitPrice?: number | null
  totalPrice?: number | null
}

export type Order = {
  id: string
  orderNumber?: string | null
  orderType: "COURSE" | "EBOOK"
  status: string
  subtotal: number
  shippingFee: number
  couponDiscount: number
  total: number
  createdAt: string
  courseId?: string
  ebookId?: string
  payment?: { id: string; status: string; ref?: string; amount?: number; slipUrl?: string }
  course?: { title: string; description?: string | null; instructor?: { name?: string | null } | null; coverImageUrl?: string | null }
  ebook?: { title: string; author?: string | null; coverImageUrl?: string | null }
  items?: OrderListItem[]
}

export type OrdersResponse = { success: boolean; data: Order[] }
