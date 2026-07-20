import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { gradeAnswer, isQuestionUnlocked } from "@/lib/mockExamEngine";

// POST: /api/mock-attempts/[attemptId]/answers - autosave + immediately
// grade one answer. Grading is not echoed back unless the question is
// already unlocked (PRACTICE) — REAL mode never reveals correctness before
// the final submit.
export async function POST(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { attemptId } = await params;
    const data = await request.json().catch(() => ({}));
    const { questionId, optionId, textAnswer } = data;
    if (!questionId) {
      return NextResponse.json({ success: false, error: "กรุณาระบุคำถาม" }, { status: 400 });
    }

    const attempt = await prisma.mockExamAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ success: false, error: "ไม่พบการทำข้อสอบนี้" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ success: false, error: "การทำข้อสอบนี้เสร็จสิ้นแล้ว" }, { status: 400 });
    }

    const question = await prisma.mockQuestion.findFirst({
      where: { id: questionId, mockExamId: attempt.mockExamId },
      include: { options: true },
    });
    if (!question) {
      return NextResponse.json({ success: false, error: "ไม่พบคำถามนี้ในข้อสอบ" }, { status: 404 });
    }

    const isPractice = attempt.mode === "PRACTICE";
    const unlocked = isPractice && (await isQuestionUnlocked(userId, questionId));
    if (isPractice && !unlocked) {
      return NextResponse.json({ success: false, error: "กรุณาปลดล็อคคำถามนี้ก่อนตอบ" }, { status: 400 });
    }

    const { isCorrect, marks } = gradeAnswer(question, question.options, { optionId, textAnswer });

    const answer = await prisma.mockStudentAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: { optionId: optionId || null, textAnswer: textAnswer || null, isCorrect, marks, answeredAt: new Date() },
      create: { attemptId, questionId, optionId: optionId || null, textAnswer: textAnswer || null, isCorrect, marks },
    });

    return NextResponse.json({
      success: true,
      data: {
        questionId: answer.questionId,
        optionId: answer.optionId,
        textAnswer: answer.textAnswer,
        isCorrect: unlocked ? answer.isCorrect : undefined,
        marksAwarded: unlocked ? answer.marks : undefined,
      },
    });
  } catch (error) {
    console.error("Error saving mock exam answer:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการบันทึกคำตอบ" }, { status: 500 });
  }
}
