import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { CARD_INCLUDE } from "@/lib/flashcardValidation";

// GET: /api/flashcards/study/[deckId] - build today's study queue for the
// authenticated user: cards already due (nextReviewAt <= now, oldest due
// first) followed by never-reviewed "new" cards, capped per day.
export async function GET(request, { params }) {
  try {
    const user = requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      include: { topic: { select: { id: true, name: true } } },
    });
    if (!deck || !deck.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดนี้" }, { status: 404 });
    }

    const now = new Date();
    const userId = user.userId;

    // Due: has a review row, nextReviewAt <= now, oldest due first.
    const dueReviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
        card: { deckId, isActive: true },
      },
      orderBy: { nextReviewAt: "asc" },
      include: { card: { include: CARD_INCLUDE } },
    });
    const dueCards = dueReviews.map((r) => r.card);

    // New: no review row at all yet for this user, capped per day.
    const reviewedCardIds = await prisma.flashcardReview.findMany({
      where: { userId, card: { deckId } },
      select: { cardId: true },
    });
    const excludeIds = reviewedCardIds.map((r) => r.cardId);

    // Caps how many never-reviewed cards get introduced per day, so a student
    // can't open the whole deck at once and flood tomorrow's due queue. Set
    // per deck from the admin deck form; 0 means no cap. See plan.md §5.
    const newCardsPerDay = deck.newCardsPerDay;

    const newCards = await prisma.flashcard.findMany({
      where: {
        deckId,
        isActive: true,
        ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
      },
      orderBy: { order: "asc" },
      ...(newCardsPerDay > 0 && { take: newCardsPerDay }),
      include: CARD_INCLUDE,
    });

    const cards = [...dueCards, ...newCards];

    return NextResponse.json({
      success: true,
      data: {
        deck: {
          id: deck.id,
          title: deck.title,
          description: deck.description,
          subject: deck.subject,
          gradeLevel: deck.gradeLevel,
          topic: deck.topic,
        },
        cards,
        dueCount: dueCards.length,
        newCount: newCards.length,
        total: cards.length,
      },
    });
  } catch (error) {
    console.error("Error building flashcard study queue:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดคิวทบทวน" },
      { status: 500 }
    );
  }
}
