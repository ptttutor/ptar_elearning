import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// PUT - แก้ไขคำถาม
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
      options,
    } = data;

    const existingQuestion = await prisma.mockQuestion.findUnique({
      where: { id },
      include: { options: true, _count: { select: { answers: true } } },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    if (!questionText || !questionType) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (คำถาม, ประเภทคำถาม)",
      }, { status: 400 });
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

    if (existingQuestion._count.answers > 0) {
      console.log(`Warning: MockQuestion ${id} has ${existingQuestion._count.answers} answers`);
    }

    const updatedQuestion = await prisma.$transaction(async (tx) => {
      await tx.mockQuestionOption.deleteMany({ where: { questionId: id } });

      const question = await tx.mockQuestion.update({
        where: { id },
        data: {
          questionText,
          questionImage: questionImage || null,
          questionType,
          topicId: topicId || null,
          marks: marks || 1,
          numericTolerance: questionType === "SHORT_ANSWER" ? (numericTolerance ?? null) : null,
          explanation: explanation || null,
          explanationImages: Array.isArray(explanationImages) ? explanationImages : [],
          updatedAt: new Date(),
        },
      });

      if (options && options.length > 0) {
        await tx.mockQuestionOption.createMany({
          data: options.map((opt) => ({
            questionId: id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: opt.order,
          })),
        });
      }

      return question;
    });

    const questionWithOptions = await prisma.mockQuestion.findUnique({
      where: { id: updatedQuestion.id },
      include: {
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: questionWithOptions,
      message: "แก้ไขคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating mock exam question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขคำถาม",
    }, { status: 500 });
  }
}

// DELETE - ลบคำถาม
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingQuestion = await prisma.mockQuestion.findUnique({
      where: { id },
      include: { _count: { select: { answers: true } } },
    });

    if (!existingQuestion) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    if (existingQuestion._count.answers > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบคำถามที่มีนักเรียนตอบแล้วได้",
      }, { status: 400 });
    }

    await prisma.mockQuestion.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "ลบคำถามสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting mock exam question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบคำถาม",
    }, { status: 500 });
  }
}

// GET - ดึงข้อมูลคำถามเดี่ยว
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const question = await prisma.mockQuestion.findUnique({
      where: { id },
      include: {
        mockExam: {
          select: {
            id: true,
            title: true,
            subject: true,
            course: { select: { id: true, title: true } },
          },
        },
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
    });

    if (!question) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบคำถามที่ระบุ",
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error("Error fetching mock exam question:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม",
    }, { status: 500 });
  }
}
