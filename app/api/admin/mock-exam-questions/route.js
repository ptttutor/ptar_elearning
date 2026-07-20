import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - รายการคำถาม
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mockExamId = searchParams.get("mockExamId");
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const search = searchParams.get("search") || "";
    const questionType = searchParams.get("questionType") || "";
    const topicId = searchParams.get("topicId") || "";
    const sortBy = searchParams.get("sortBy") || "order";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!mockExamId) {
      return NextResponse.json({
        success: false,
        error: "Mock exam ID is required",
      }, { status: 400 });
    }

    const where = {
      mockExamId,
      ...(search && {
        OR: [
          { questionText: { contains: search, mode: "insensitive" } },
          { explanation: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(questionType && { questionType }),
      ...(topicId && { topicId }),
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const totalCount = await prisma.mockQuestion.count({ where });

    const questions = await prisma.mockQuestion.findMany({
      where,
      include: {
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: { page, pageSize, totalCount, totalPages },
    });
  } catch (error) {
    console.error("Error fetching mock exam questions:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม",
    }, { status: 500 });
  }
}

// POST - สร้างคำถามใหม่
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      questionText,
      questionImage,
      questionType,
      topicId,
      marks,
      numericTolerance,
      explanation,
      explanationImages,
      mockExamId,
      options,
    } = data;

    if (!questionText || !mockExamId || !questionType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (คำถาม, ข้อสอบจำลอง, ประเภทคำถาม)",
      }, { status: 400 });
    }

    const examExists = await prisma.mockExam.findUnique({ where: { id: mockExamId } });
    if (!examExists) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบจำลองที่ระบุ",
      }, { status: 404 });
    }

    if (topicId) {
      const topicExists = await prisma.mockTopic.findUnique({ where: { id: topicId } });
      if (!topicExists) {
        return NextResponse.json({
          success: false,
          error: "ไม่พบหัวข้อที่ระบุ",
        }, { status: 404 });
      }
    }

    if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
      if (!options || options.length < 2) {
        return NextResponse.json({
          success: false,
          error: "กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก",
        }, { status: 400 });
      }

      const correctOptions = options.filter((opt) => opt.isCorrect);
      if (correctOptions.length === 0) {
        return NextResponse.json({
          success: false,
          error: "กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก",
        }, { status: 400 });
      }
    }

    if (questionType === "SHORT_ANSWER" && (!options || !options[0]?.optionText)) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกเฉลยคำตอบสำหรับคำถามแบบตอบสั้น",
      }, { status: 400 });
    }

    const currentMax = await prisma.mockQuestion.aggregate({
      where: { mockExamId },
      _max: { order: true },
    });

    const question = await prisma.mockQuestion.create({
      data: {
        questionText,
        questionImage: questionImage || null,
        questionType,
        topicId: topicId || null,
        marks: marks || 1,
        numericTolerance: questionType === "SHORT_ANSWER" ? (numericTolerance ?? null) : null,
        explanation: explanation || null,
        explanationImages: Array.isArray(explanationImages) ? explanationImages : [],
        order: (currentMax._max.order ?? 0) + 1,
        mockExamId,
        ...(options &&
          options.length > 0 && {
            options: {
              create: options.map((opt) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                order: opt.order,
              })),
            },
          }),
      },
      include: {
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: question,
      message: "สร้างคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error creating mock exam question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการสร้างคำถาม",
    }, { status: 500 });
  }
}
