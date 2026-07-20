import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { isQuestionUnlocked, getOrCreateWallet } from "@/lib/mockExamEngine";

// POST: /api/mock-attempts/[attemptId]/questions/[questionId]/unlock
// PRACTICE-mode only. Spends `MockExam.practiceUnlockCost` tokens from the
// user's global wallet the first time this question is unlocked — the
// unlock (MockPracticeUnlock) is keyed by (userId, questionId), not by
// attempt, so revisiting the same question in a later practice attempt is
// free.
export async function POST(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { attemptId, questionId } = await params;

    const attempt = await prisma.mockExamAttempt.findUnique({
      where: { id: attemptId },
      include: { mockExam: { select: { practiceUnlockCost: true } } },
    });
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ success: false, error: "ไม่พบการทำข้อสอบนี้" }, { status: 404 });
    }
    if (attempt.mode !== "PRACTICE") {
      return NextResponse.json({ success: false, error: "ปลดล็อคได้เฉพาะโหมดฝึกฝนเท่านั้น" }, { status: 400 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ success: false, error: "การทำข้อสอบนี้เสร็จสิ้นแล้ว" }, { status: 400 });
    }

    const question = await prisma.mockQuestion.findFirst({
      where: { id: questionId, mockExamId: attempt.mockExamId },
      include: { options: true, topic: { select: { id: true, name: true } } },
    });
    if (!question) {
      return NextResponse.json({ success: false, error: "ไม่พบคำถามนี้ในข้อสอบ" }, { status: 404 });
    }

    let alreadyUnlocked = await isQuestionUnlocked(userId, questionId);
    let wallet = await getOrCreateWallet(userId);

    if (!alreadyUnlocked) {
      const cost = attempt.mockExam.practiceUnlockCost;
      if (wallet.tokens < cost) {
        return NextResponse.json({ success: false, error: "Token ไม่พอสำหรับปลดล็อคข้อนี้" }, { status: 409 });
      }
      wallet = await prisma.mockPracticeWallet.update({
        where: { userId },
        data: { tokens: { decrement: cost } },
      });
      await prisma.mockPracticeUnlock.create({ data: { userId, questionId } });
    }

    const answer = await prisma.mockStudentAnswer.findUnique({
      where: { attemptId_questionId: { attemptId, questionId } },
    });

    return NextResponse.json({
      success: true,
      data: {
        practiceTokens: wallet.tokens,
        question: {
          id: question.id,
          locked: false,
          questionText: question.questionText,
          questionImage: question.questionImage,
          questionType: question.questionType,
          marks: question.marks,
          topic: question.topic,
          explanation: question.explanation,
          explanationImages: question.explanationImages,
          options: question.options.map((o) => ({ id: o.id, optionText: o.optionText, isCorrect: o.isCorrect })),
          selectedOptionId: answer?.optionId ?? null,
          textAnswer: answer?.textAnswer ?? null,
          isCorrect: answer?.isCorrect ?? null,
          marksAwarded: answer?.marks ?? null,
        },
      },
    });
  } catch (error) {
    console.error("Error unlocking mock exam question:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการปลดล็อคคำถาม" }, { status: 500 });
  }
}
