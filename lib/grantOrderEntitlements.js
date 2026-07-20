import prisma from "@/lib/prisma";

/**
 * Grants access records for every line item on a paid order. Called from
 * every "payment confirmed" code path instead of each one hand-rolling its
 * own per-type logic.
 *
 * Deliberately keyed off `OrderItem` (itemType/itemId), not the legacy
 * singular `Order.courseId`/`orderType` fields — those are never set by the
 * real order-creation flow (`POST /api/orders` only ever populates `items`),
 * so any logic gated on them silently never runs for checkout-originated
 * orders. Idempotent: safe to call more than once for the same order.
 */
export async function grantEntitlementsForOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  for (const item of order.items) {
    if (item.itemType === "COURSE") {
      const exists = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: order.userId, courseId: item.itemId } },
      });
      if (!exists) {
        await prisma.enrollment.create({
          data: { userId: order.userId, courseId: item.itemId, status: "ACTIVE" },
        });
      }
    } else if (item.itemType === "MOCK_EXAM") {
      const exists = await prisma.mockExamPurchase.findUnique({
        where: { userId_mockExamId: { userId: order.userId, mockExamId: item.itemId } },
      });
      if (!exists) {
        await prisma.mockExamPurchase.create({
          data: { userId: order.userId, mockExamId: item.itemId, orderId: order.id },
        });
      }
    }
    // EBOOK: intentionally left untouched here — no existing consumer
    // reliably uses EbookDownload today, fixing that is a separate concern.
  }
}
