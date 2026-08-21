import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { applyReview } from "@/lib/sm2";

const VALID_ANSWER_MODES = ["SELF_GRADE", "MULTIPLE_CHOICE", "TYPED"];

// POST: /api/flashcards/review - record the result of studying one card.
// grade (0-5) is computed client-side (self-grade button, MC pick, typed
// check, or swipe direction — see plan.md §3.1) and converges here to a
// single SM-2 update + audit log write.
export async function POST(request) {
  try {
    const user = requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.userId; // never trust a client-supplied userId

    const body = await request.json().catch(() => ({}));
    const { cardId, grade, answerMode, userAnswer } = body;

    if (!cardId || typeof cardId !== "string") {
      return NextResponse.json({ success: false, error: "กรุณาระบุการ์ด" }, { status: 400 });
    }
    if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
      return NextResponse.json({ success: false, error: "grade ต้องเป็นจำนวนเต็ม 0-5" }, { status: 400 });
    }
    if (!VALID_ANSWER_MODES.includes(answerMode)) {
      return NextResponse.json({ success: false, error: "answerMode ไม่ถูกต้อง" }, { status: 400 });
    }

    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: { select: { isActive: true } } },
    });
    if (!card || !card.isActive || !card.deck?.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบการ์ดนี้ หรือชุดถูกปิดใช้งานแล้ว" }, { status: 404 });
    }

    const existing = await prisma.flashcardReview.findUnique({
      where: { userId_cardId: { userId, cardId } },
    });

    const now = new Date();
    const next = applyReview(existing, grade, now);
    const intervalBefore = existing?.interval ?? 0;

    // wasCorrect has no meaning for SELF_GRADE (the student self-reports,
    // there's no system-verified answer) — plan.md §2.3 documents this null.
    const wasCorrect = answerMode === "SELF_GRADE" ? null : grade >= 3;

    const [review] = await prisma.$transaction([
      prisma.flashcardReview.upsert({
        where: { userId_cardId: { userId, cardId } },
        update: next,
        create: { userId, cardId, ...next },
      }),
      prisma.flashcardReviewLog.create({
        data: {
          userId,
          cardId,
          grade,
          intervalBefore,
          intervalAfter: next.interval,
          easeFactorAfter: next.easeFactor,
          answerMode,
          userAnswer: userAnswer ?? null,
          wasCorrect,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Error saving flashcard review:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการบันทึกผลการทบทวน" },
      { status: 500 }
    );
  }
}
