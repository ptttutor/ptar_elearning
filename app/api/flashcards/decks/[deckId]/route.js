import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { hasFlashcardDeckAccess } from "@/lib/flashcardAccess";

// GET: /api/flashcards/decks/[deckId] - one deck's public info plus whether
// the logged-in user already has access. Used by the checkout page (to show
// the price and skip checkout if the deck is already owned) — same role as
// /api/mock-exams/[id] + /access combined.
export async function GET(request, { params }) {
  try {
    const user = requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;
    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: deckId },
      select: {
        id: true,
        title: true,
        description: true,
        coverImageUrl: true,
        price: true,
        discountPrice: true,
        isActive: true,
      },
    });
    if (!deck || !deck.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดนี้" }, { status: 404 });
    }

    const hasAccess = await hasFlashcardDeckAccess(user.userId, deck);
    const { isActive: _isActive, ...publicDeck } = deck;

    return NextResponse.json({ success: true, data: { ...publicDeck, hasAccess } });
  } catch (error) {
    console.error("Error fetching flashcard deck:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลชุดแฟลชการ์ด" }, { status: 500 });
  }
}
