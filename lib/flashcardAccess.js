import prisma from "@/lib/prisma";

/**
 * Whether a user may study a flashcard deck. A deck with no price is free for
 * everyone (which is what every deck was before decks became sellable, so
 * existing decks keep working untouched); a priced deck needs a purchase row,
 * which is created when an order containing it is paid — see
 * grantEntitlementsForOrder.
 */
export async function hasFlashcardDeckAccess(userId, deck) {
  if (!deck.price) return true;

  const purchase = await prisma.flashcardDeckPurchase.findUnique({
    where: { userId_deckId: { userId, deckId: deck.id } },
  });
  return !!purchase;
}
