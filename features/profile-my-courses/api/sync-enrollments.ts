import http from "@/lib/http"
import { fetchOrdersForUser } from "@/lib/api/orders"

/**
 * Backfill: a completed order should always have created an enrollment,
 * but if something raced or failed, this creates the missing one so the
 * course actually shows up in "my courses". Only ever posts to the plural
 * /api/enrollments route (unlike features/order-success's enrollUser,
 * which also tries the singular route — this call site never needed that).
 */
export async function findMissingCourseIdsFromOrders(userId: string, existingCourseIds: Set<string>): Promise<string[]> {
  const orders = await fetchOrdersForUser(userId)
  const missing = new Set<string>()

  for (const order of orders) {
    const paymentStatus = String(order?.payment?.status ?? "").toUpperCase()
    const orderStatus = String(order?.status ?? "").toUpperCase()
    const isPaid = ["COMPLETED", "APPROVED"].includes(paymentStatus) || orderStatus === "COMPLETED"
    if (!isPaid) continue

    const courseIds = new Set<string>()
    if (order?.course?.id) courseIds.add(String(order.course.id))
    if (Array.isArray(order?.items)) {
      for (const item of order.items) {
        if (String(item?.itemType ?? "").toUpperCase() !== "COURSE") continue
        const cid = item?.itemId ?? item?.courseId
        if (cid) courseIds.add(String(cid))
      }
    }

    for (const courseId of courseIds) {
      if (courseId && !existingCourseIds.has(courseId)) missing.add(courseId)
    }
  }

  return Array.from(missing)
}

export async function createEnrollment(userId: string, courseId: string): Promise<void> {
  await http.post(`/api/enrollments`, { userId, courseId })
}
