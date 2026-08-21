import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { CARD_INCLUDE, validateAnswerModeFields } from "@/lib/flashcardValidation";

// PUT - แก้ไขการ์ด
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { front, frontImage, back, backImage, hint, answerMode, acceptedAnswers, numericTolerance, options } = data;

    const existingCard = await prisma.flashcard.findUnique({ where: { id } });
    if (!existingCard) {
      return NextResponse.json({ success: false, error: "ไม่พบการ์ดที่ระบุ" }, { status: 404 });
    }

    if (!front || !back) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (คำถาม, คำตอบ)",
      }, { status: 400 });
    }

    const mode = answerMode || "SELF_GRADE";
    const validationError = validateAnswerModeFields({ answerMode: mode, options, acceptedAnswers });
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const updatedCard = await prisma.$transaction(async (tx) => {
      await tx.flashcardOption.deleteMany({ where: { cardId: id } });

      const card = await tx.flashcard.update({
        where: { id },
        data: {
          front,
          frontImage: frontImage || null,
          back,
          backImage: backImage || null,
          hint: hint || null,
          answerMode: mode,
          acceptedAnswers: mode === "TYPED" ? (acceptedAnswers || []).filter((a) => a && a.trim()) : [],
          numericTolerance: mode === "TYPED" ? (numericTolerance ?? null) : null,
          updatedAt: new Date(),
        },
      });

      if (mode === "MULTIPLE_CHOICE" && options?.length > 0) {
        await tx.flashcardOption.createMany({
          data: options.map((opt, i) => ({
            cardId: id,
            optionText: opt.optionText,
            isCorrect: !!opt.isCorrect,
            order: opt.order ?? i + 1,
          })),
        });
      }

      return card;
    });

    const cardWithOptions = await prisma.flashcard.findUnique({
      where: { id: updatedCard.id },
      include: CARD_INCLUDE,
    });

    return NextResponse.json({ success: true, data: cardWithOptions, message: "แก้ไขการ์ดสำเร็จ" });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขการ์ด",
    }, { status: 500 });
  }
}

// DELETE - ลบการ์ด
// บล็อกการลบถ้ามีนักเรียนทบทวนการ์ดใบนี้ไปแล้ว (มี FlashcardReview ผูกอยู่)
// เพื่อไม่ให้ประวัติ/สถิติของนักเรียนหาย — ปิดการมองเห็นด้วยการแก้ deck แทน
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingCard = await prisma.flashcard.findUnique({
      where: { id },
      include: { _count: { select: { reviews: true } } },
    });

    if (!existingCard) {
      return NextResponse.json({ success: false, error: "ไม่พบการ์ดที่ระบุ" }, { status: 404 });
    }

    if (existingCard._count.reviews > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบการ์ดที่มีนักเรียนทบทวนไปแล้วได้",
      }, { status: 400 });
    }

    await prisma.flashcard.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "ลบการ์ดสำเร็จ" });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบการ์ด",
    }, { status: 500 });
  }
}
