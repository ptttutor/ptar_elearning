import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { hasMockExamAccess } from "@/lib/mockExamEngine";

// POST: /api/mock-exams/[id]/attempts - start a new attempt, or resume an
// in-progress one for the requested mode.
export async function POST(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { id: mockExamId } = await params;
    const data = await request.json().catch(() => ({}));
    const mode = data.mode === "PRACTICE" ? "PRACTICE" : data.mode === "REAL" ? "REAL" : null;
    if (!mode) {
      return NextResponse.json({ success: false, error: "กรุณาระบุโหมด (PRACTICE หรือ REAL)" }, { status: 400 });
    }

    const exam = await prisma.mockExam.findUnique({
      where: { id: mockExamId },
      include: { questions: { where: { isActive: true }, select: { marks: true } } },
    });
    if (!exam || !exam.isActive) {
      return NextResponse.json({ success: false, error: "ไม่พบข้อสอบจำลองที่ระบุ" }, { status: 404 });
    }
    if (mode === "PRACTICE" && !exam.allowPracticeMode) {
      return NextResponse.json({ success: false, error: "ข้อสอบนี้ไม่เปิดโหมดฝึกฝน" }, { status: 400 });
    }
    if (mode === "REAL" && !exam.allowRealMode) {
      return NextResponse.json({ success: false, error: "ข้อสอบนี้ไม่เปิดโหมดสอบจริง" }, { status: 400 });
    }
    if (exam.questions.length === 0) {
      return NextResponse.json({ success: false, error: "ข้อสอบนี้ยังไม่มีคำถาม" }, { status: 400 });
    }

    // Resume an in-progress attempt of the same mode instead of creating a duplicate.
    const existingInProgress = await prisma.mockExamAttempt.findFirst({
      where: { mockExamId, userId, mode, status: "IN_PROGRESS" },
    });
    if (existingInProgress) {
      return NextResponse.json({ success: true, data: { attemptId: existingInProgress.id, mode } });
    }

    if (mode === "REAL") {
      const allowed = await hasMockExamAccess(userId, exam);
      if (!allowed) {
        return NextResponse.json({
          success: false,
          error: "กรุณาซื้อข้อสอบชุดนี้ก่อนทำข้อสอบจริง",
        }, { status: 403 });
      }

      const completedRealAttempts = await prisma.mockExamAttempt.count({
        where: { mockExamId, userId, mode: "REAL", status: "COMPLETED" },
      });
      if (completedRealAttempts >= exam.attemptsAllowed) {
        return NextResponse.json({
          success: false,
          error: `ทำข้อสอบจริงครบ ${exam.attemptsAllowed} ครั้งแล้ว`,
        }, { status: 400 });
      }
    }

    const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);

    const attempt = await prisma.mockExamAttempt.create({
      data: { mockExamId, userId, mode, totalMarks },
    });

    return NextResponse.json({ success: true, data: { attemptId: attempt.id, mode } }, { status: 201 });
  } catch (error) {
    console.error("Error starting mock exam attempt:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการเริ่มทำข้อสอบ" }, { status: 500 });
  }
}
