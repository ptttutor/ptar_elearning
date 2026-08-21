import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

// GET: /api/flashcards/decks - list active decks for browsing, with
// per-user dueCount/newCount so the list page can show "ถึงกำหนดทบทวน N ใบ"
// badges without a second round-trip per deck.
export async function GET(request) {
  try {
    const user = requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const gradeLevel = searchParams.get("gradeLevel");

    const where = {
      isActive: true,
      ...(subject && { subject }),
      ...(gradeLevel && { gradeLevel }),
    };

    const decks = await prisma.flashcardDeck.findMany({
      where,
      include: {
        topic: { select: { id: true, name: true } },
        _count: { select: { cards: { where: { isActive: true } } } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const now = new Date();

    // Per-deck due/new counts for this user. Kept as a small per-deck loop
    // (rather than one grouped query) since deck lists are short and this
    // stays readable — revisit with a groupBy if deck counts grow large.
    const data = await Promise.all(
      decks.map(async (deck) => {
        const totalCards = deck._count.cards;
        const [dueCount, reviewedCount] = await Promise.all([
          prisma.flashcardReview.count({
            where: {
              userId: user.userId,
              nextReviewAt: { lte: now },
              card: { deckId: deck.id, isActive: true },
            },
          }),
          prisma.flashcardReview.count({
            where: {
              userId: user.userId,
              card: { deckId: deck.id, isActive: true },
            },
          }),
        ]);
        const newCount = Math.max(0, totalCards - reviewedCount);

        return {
          id: deck.id,
          title: deck.title,
          description: deck.description,
          subject: deck.subject,
          gradeLevel: deck.gradeLevel,
          coverImageUrl: deck.coverImageUrl,
          topic: deck.topic,
          totalCards,
          dueCount,
          newCount,
        };
      })
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching flashcard decks:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลชุดแฟลชการ์ด" },
      { status: 500 }
    );
  }
}
