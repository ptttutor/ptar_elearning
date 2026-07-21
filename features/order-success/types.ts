export type OrderItem = {
  id?: string
  itemType: "COURSE" | "EBOOK" | string
  itemId: string
  title?: string | null
  quantity?: number | null
  unitPrice?: number | null
  totalPrice?: number | null
  createdAt?: string
}

export type Order = {
  id: string
  orderNumber?: string | null
  orderType?: "COURSE" | "EBOOK"
  status: string
  subtotal: number
  shippingFee: number
  tax?: number | null
  discount?: number | null
  couponDiscount: number
  total: number
  createdAt: string
  couponCode?: string | null
  course?: { id: string; title: string; isPhysical?: boolean }
  ebook?: {
    id: string
    title: string
    coverImageUrl?: string | null
    isPhysical?: boolean
    fileUrl?: string | null
    previewUrl?: string | null
  }
  payment?: {
    id: string
    status: string
    method?: string | null
    ref?: string
    amount?: number
    paidAt?: string | null
    slipUrl?: string
    notes?: string
    uploadedAt?: string | null
    verifiedAt?: string | null
    verifiedBy?: string | null
    senderBank?: string | null
    senderName?: string | null
  }
  shipping?: { shippingMethod?: string; status?: string }
  shippingAddress?: {
    name?: string
    phone?: string
    address?: string
    district?: string
    province?: string
    postalCode?: string
  }
  items?: OrderItem[]
}

export type OrderResponse = { success: boolean; data?: Order; error?: string }

export type NormalizedShipping = {
  name: string
  phone: string
  address: string
  district: string
  province: string
  postalCode: string
}

export type SummaryRow = { label: string; value: string; accent?: boolean }

export type EnrollmentStatus = "loading" | "exists" | "missing" | "error"
