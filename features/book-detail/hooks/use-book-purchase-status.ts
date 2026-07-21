import { useEffect, useState } from "react"
import { fetchHasPurchasedEbook } from "@/features/book-detail/api/purchase-status"

export function useBookPurchaseStatus(userId: string | undefined, ebookId: string, isAuthenticated: boolean) {
  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !userId || !ebookId) {
      setHasPurchased(false)
      return
    }
    let active = true
    fetchHasPurchasedEbook(userId, ebookId).then((found) => {
      if (active) setHasPurchased(found)
    })
    return () => {
      active = false
    }
  }, [isAuthenticated, userId, ebookId])

  return hasPurchased
}
