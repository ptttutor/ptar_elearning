import prisma from "@/lib/prisma";

/**
 * Whether a user may study a flashcard deck. Every deck — free or priced —
 * must be "purchased" first (a free deck just goes through checkout at ฿0,
 * which grants the entitlement immediately), so the price is always shown and
 * access always comes from a FlashcardDeckPurchase row, created when an order
 * containing the deck is paid (see grantEntitlementsForOrder).
 *
 * Grandfathering: students who were already studying a deck before decks
 * became sellable have review history on it and keep access, so switching this
 * on doesn't lock out people mid-course. Only newcomers go through checkout.
 */
export async function hasFlashcardDeckAccess(userId, deck) {
  const purchase = await prisma.flashcardDeckPurchase.findUnique({
    where: { userId_deckId: { userId, deckId: deck.id } },
  });
  if (purchase) return true;

  const priorStudy = await prisma.flashcardReview.findFirst({
    where: { userId, card: { deckId: deck.id } },
    select: { id: true },
  });
  return !!priorStudy;
}
