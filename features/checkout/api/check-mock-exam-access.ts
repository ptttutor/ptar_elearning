import http from "@/lib/http"

/**
 * Already-paid guard for mock exams: uses the real entitlement check, not
 * the order.orderType-based lookup that course/ebook checkout relies on
 * (see lib/api/orders.ts findExistingOrder) — mock exam access is granted
 * per-entitlement, not just "has an order that isn't cancelled".
 */
export async function checkMockExamAccess(id: string): Promise<boolean> {
  try {
    const res = await http.get(`/api/mock-exams/${id}/access`)
    return Boolean(res.data?.success && res.data?.data?.hasAccess)
  } catch {
    return false
  }
}
