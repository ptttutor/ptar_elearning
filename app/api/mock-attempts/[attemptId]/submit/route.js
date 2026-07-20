import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

// POST: /api/mock-attempts/[attemptId]/submit - finalize the attempt.
// Answers are already graded per-question at save time (see answers/route.js);
// this just sums them and marks the attempt COMPLETED.
export async function POST(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { attemptId } = await params;
    const attempt = await prisma.mockExamAttempt.findUnique({
      where: { id: attemptId },
      include: { mockExam: { select: { passingMarks: true } } },
    });
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ success: false, error: "ไม่พบการทำข้อสอบนี้" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ success: false, error: "การทำข้อสอบนี้เสร็จสิ้นแล้ว" }, { status: 400 });
    }

    const [totalMarksAgg, answers] = await Promise.all([
      prisma.mockQuestion.aggregate({
        where: { mockExamId: attempt.mockExamId, isActive: true },
        _sum: { marks: true },
      }),
      prisma.mockStudentAnswer.findMany({ where: { attemptId } }),
    ]);

    const totalMarks = totalMarksAgg._sum.marks || 0;
    const obtainedMarks = answers.reduce((sum, a) => sum + (a.marks || 0), 0);
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passed = obtainedMarks >= attempt.mockExam.passingMarks;

    const updated = await prisma.mockExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        totalMarks,
        obtainedMarks,
        percentage,
        passed,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: updated.id,
        totalMarks: updated.totalMarks,
        obtainedMarks: updated.obtainedMarks,
        percentage: updated.percentage,
        passed: updated.passed,
      },
    });
  } catch (error) {
    console.error("Error submitting mock exam attempt:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการส่งข้อสอบ" }, { status: 500 });
  }
}
