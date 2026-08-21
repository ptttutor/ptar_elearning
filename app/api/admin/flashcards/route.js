import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { CARD_INCLUDE, validateAnswerModeFields } from "@/lib/flashcardValidation";

// GET - รายการการ์ดในชุด
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const answerMode = searchParams.get("answerMode") || "";
    const sortBy = searchParams.get("sortBy") || "order";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!deckId) {
      return NextResponse.json({ success: false, error: "Deck ID is required" }, { status: 400 });
    }

    const where = {
      deckId,
      ...(search && {
        OR: [
          { front: { contains: search, mode: "insensitive" } },
          { back: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(answerMode && { answerMode }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const totalCount = await prisma.flashcard.count({ where });

    const cards = await prisma.flashcard.findMany({
      where,
      include: CARD_INCLUDE,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: cards,
      pagination: { page, pageSize, totalCount, totalPages },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลการ์ด",
    }, { status: 500 });
  }
}

// POST - สร้างการ์ดใหม่
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      deckId,
      front,
      frontImage,
      back,
      backImage,
      hint,
      answerMode,
      acceptedAnswers,
      numericTolerance,
      options,
    } = data;

    if (!deckId || !front || !back) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชุดการ์ด, คำถาม, คำตอบ)",
      }, { status: 400 });
    }

    const deckExists = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!deckExists) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดที่ระบุ" }, { status: 404 });
    }

    const mode = answerMode || "SELF_GRADE";
    const validationError = validateAnswerModeFields({ answerMode: mode, options, acceptedAnswers });
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const currentMax = await prisma.flashcard.aggregate({
      where: { deckId },
      _max: { order: true },
    });

    const card = await prisma.flashcard.create({
      data: {
        deckId,
        front,
        frontImage: frontImage || null,
        back,
        backImage: backImage || null,
        hint: hint || null,
        answerMode: mode,
        acceptedAnswers: mode === "TYPED" ? (acceptedAnswers || []).filter((a) => a && a.trim()) : [],
        numericTolerance: mode === "TYPED" ? (numericTolerance ?? null) : null,
        order: (currentMax._max.order ?? 0) + 1,
        ...(mode === "MULTIPLE_CHOICE" &&
          options?.length > 0 && {
            options: {
              create: options.map((opt, i) => ({
                optionText: opt.optionText,
                isCorrect: !!opt.isCorrect,
                order: opt.order ?? i + 1,
              })),
            },
          }),
      },
      include: CARD_INCLUDE,
    });

    return NextResponse.json({ success: true, data: card, message: "สร้างการ์ดสำเร็จ" });
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างการ์ด",
    }, { status: 500 });
  }
}
