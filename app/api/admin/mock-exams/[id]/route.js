import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// PUT - แก้ไขข้อสอบจำลอง
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const {
      title,
      description,
      courseId,
      subject,
      gradeLevel,
      timeLimit,
      passingMarks,
      attemptsAllowed,
      allowPracticeMode,
      allowRealMode,
      practiceUnlockCost,
      isActive,
    } = data;

    const existingExam = await prisma.mockExam.findUnique({ where: { id } });
    if (!existingExam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบจำลองที่ระบุ",
      }, { status: 404 });
    }

    if (!title || !subject) {
      return NextResponse.json({
        success: false,
        error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อข้อสอบ, วิชา)",
      }, { status: 400 });
    }

    if (courseId) {
      const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
      if (!courseExists) {
        return NextResponse.json({
          success: false,
          error: "ไม่พบคอร์สที่ระบุ",
        }, { status: 404 });
      }
    }

    if (!allowPracticeMode && !allowRealMode) {
      return NextResponse.json({
        success: false,
        error: "ต้องเปิดใช้งานอย่างน้อยหนึ่งโหมด (ฝึกฝน หรือ สอบจริง)",
      }, { status: 400 });
    }

    const updatedExam = await prisma.mockExam.update({
      where: { id },
      data: {
        title,
        description: description || null,
        courseId: courseId || null,
        subject,
        gradeLevel: gradeLevel || null,
        timeLimit: timeLimit || null,
        passingMarks: passingMarks || 0,
        attemptsAllowed: attemptsAllowed || 1,
        allowPracticeMode: allowPracticeMode ?? true,
        allowRealMode: allowRealMode ?? true,
        practiceUnlockCost: practiceUnlockCost ?? 1,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      },
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedExam,
      message: "แก้ไขข้อสอบจำลองสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating mock exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการแก้ไขข้อสอบจำลอง",
    }, { status: 500 });
  }
}

// DELETE - ลบข้อสอบจำลอง
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existingExam = await prisma.mockExam.findUnique({
      where: { id },
      include: { _count: { select: { questions: true, attempts: true } } },
    });

    if (!existingExam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบจำลองที่ระบุ",
      }, { status: 404 });
    }

    if (existingExam._count.attempts > 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่สามารถลบข้อสอบจำลองที่มีนักเรียนทำแล้วได้",
      }, { status: 400 });
    }

    // ลบข้อสอบ (จะลบคำถามและตัวเลือกด้วยเนื่องจาก onDelete: Cascade)
    await prisma.mockExam.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "ลบข้อสอบจำลองสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting mock exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการลบข้อสอบจำลอง",
    }, { status: 500 });
  }
}

// GET - ดึงข้อมูลข้อสอบจำลองเดี่ยว
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const exam = await prisma.mockExam.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        questions: {
          include: {
            options: true,
            topic: { select: { id: true, name: true } },
            _count: { select: { answers: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { questions: true, attempts: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อสอบจำลองที่ระบุ",
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error("Error fetching mock exam:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบจำลอง",
    }, { status: 500 });
  }
}
