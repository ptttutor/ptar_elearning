import { useEffect, useRef, useState } from "react"
import { enrollUser, checkEnrollmentExists } from "@/features/order-success/api/enroll"
import { getSafeUserId, isPaidLikeStatus, getPaymentStatus } from "@/features/order-success/selectors"
import type { EnrollmentStatus, Order } from "@/features/order-success/types"

function getCourseItems(order: Order) {
  return Array.isArray(order.items)
    ? order.items.filter((i) => (i.itemType || "").toUpperCase() === "COURSE")
    : order.course?.id
      ? [{ itemType: "COURSE", itemId: order.course.id, title: order.course.title }]
      : []
}

/**
 * Auto-enrolls the user into every course item on a paid order, then tracks
 * per-course enrollment status so the UI can offer a manual retry button if
 * the auto-enroll silently failed (or enrollment doesn't exist yet).
 */
export function useCourseEnrollment(order: Order | null, user: any) {
  const [enrollErrByCourse, setEnrollErrByCourse] = useState<Record<string, string | null>>({})
  const triedEnrollSetRef = useRef<Set<string>>(new Set())
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, EnrollmentStatus>>({})

  // Auto-enroll once the order is paid.
  useEffect(() => {
    if (!order) return
    const paymentStatus = getPaymentStatus(order)
    const userId = getSafeUserId(user)
    if (!isPaidLikeStatus(paymentStatus) || !userId) return

    const items = getCourseItems(order)
    if (!items.length) return

    ;(async () => {
      for (const item of items) {
        const courseId = String(item.itemId)
        if (triedEnrollSetRef.current.has(courseId)) continue
        triedEnrollSetRef.current.add(courseId)
        try {
          await enrollUser(userId, courseId, order.id)
          setEnrollErrByCourse((prev) => ({ ...prev, [courseId]: null }))
        } catch (e: any) {
          setEnrollErrByCourse((prev) => ({ ...prev, [courseId]: e?.message || "Enroll ไม่สำเร็จ" }))
        }
      }
    })()
  }, [order, user])

  // Track whether each course's enrollment actually exists (for the retry button).
  useEffect(() => {
    if (!order) return
    const paymentStatus = getPaymentStatus(order)
    const userId = getSafeUserId(user)
    if (!isPaidLikeStatus(paymentStatus) || !userId) return

    const items = getCourseItems(order)
    if (!items.length) return

    let cancelled = false
    ;(async () => {
      const loadingState: Record<string, EnrollmentStatus> = {}
      for (const item of items) loadingState[String(item.itemId)] = "loading"
      if (!cancelled) setEnrollmentStatus((prev) => ({ ...prev, ...loadingState }))

      for (const item of items) {
        const courseId = String(item.itemId)
        try {
          const exists = await checkEnrollmentExists(userId, courseId)
          if (!cancelled) setEnrollmentStatus((prev) => ({ ...prev, [courseId]: exists ? "exists" : "missing" }))
        } catch {
          if (!cancelled) setEnrollmentStatus((prev) => ({ ...prev, [courseId]: "error" }))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [order, user])

  const retryEnroll = async (courseId: string, orderId: string) => {
    const userId = getSafeUserId(user)
    if (!userId) return
    try {
      await enrollUser(userId, courseId, orderId)
      setEnrollErrByCourse((prev) => ({ ...prev, [courseId]: null }))
      setEnrollmentStatus((prev) => ({ ...prev, [courseId]: "exists" }))
    } catch (e: any) {
      setEnrollErrByCourse((prev) => ({ ...prev, [courseId]: e?.message || "Enroll ไม่สำเร็จ" }))
    }
  }

  return { enrollErrByCourse, enrollmentStatus, retryEnroll }
}
