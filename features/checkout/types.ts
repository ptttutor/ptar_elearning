export type CheckoutCourse = {
  id: string
  title: string
  description?: string | null
  price: number
  discountPrice?: number | null
  isFree?: boolean
  isPhysical?: boolean
  coverImageUrl?: string | null
}

export type CheckoutEbook = {
  id: string
  title: string
  description?: string | null
  price: number
  discountPrice?: number | null
  coverImageUrl?: string | null
  isPhysical?: boolean
}

export type CheckoutMockExam = {
  id: string
  title: string
  description?: string | null
  price: number
  discountPrice?: number | null
}

export type CheckoutFlashcardDeck = {
  id: string
  title: string
  description?: string | null
  coverImageUrl?: string | null
  price: number
  discountPrice?: number | null
  hasAccess: boolean
}
