import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";
import { isQuestionUnlocked, getOrCreateWallet } from "@/lib/mockExamEngine";

// GET: /api/mock-attempts/[attemptId] - attempt view for the taking UI.
export async function GET(request, { params }) {
  try {
    const session = requireUser(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;

    const { attemptId } = await params;
    const attempt = await prisma.mockExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockExam: {
          select: { id: true, title: true, subject: true, timeLimit: true, practiceUnlockCost: true },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ success: false, error: "ไม่พบการทำข้อสอบนี้" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ success: false, error: "การทำข้อสอบนี้เสร็จสิ้นแล้ว" }, { status: 400 });
    }

    const isPractice = attempt.mode === "PRACTICE";

    const questions = await prisma.mockQuestion.findMany({
      where: { mockExamId: attempt.mockExamId, isActive: true },
      include: {
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
      },
      orderBy: { order: "asc" },
    });

    const answers = await prisma.mockStudentAnswer.findMany({ where: { attemptId } });
    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    const questionViews = await Promise.all(
      questions.map(async (q) => {
        const answer = answerByQuestion.get(q.id) || null;

        if (isPractice) {
          const unlocked = await isQuestionUnlocked(userId, q.id);
          if (!unlocked) {
            return { id: q.id, order: q.order, marks: q.marks, locked: true };
          }
          return {
            id: q.id,
            order: q.order,
            marks: q.marks,
            locked: false,
            questionText: q.questionText,
            questionImage: q.questionImage,
            questionType: q.questionType,
            topic: q.topic,
            explanation: q.explanation,
            explanationImages: q.explanationImages,
            options: q.options.map((o) => ({ id: o.id, optionText: o.optionText, isCorrect: o.isCorrect })),
            selectedOptionId: answer?.optionId ?? null,
            textAnswer: answer?.textAnswer ?? null,
            isCorrect: answer?.isCorrect ?? null,
            marksAwarded: answer?.marks ?? null,
          };
        }

        // REAL mode: full question, but never leak isCorrect/explanation mid-attempt.
        return {
          id: q.id,
          order: q.order,
          marks: q.marks,
          locked: false,
          questionText: q.questionText,
          questionImage: q.questionImage,
          questionType: q.questionType,
          options: q.options.map((o) => ({ id: o.id, optionText: o.optionText })),
          selectedOptionId: answer?.optionId ?? null,
          textAnswer: answer?.textAnswer ?? null,
        };
      })
    );

    let remainingSeconds = null;
    if (!isPractice && attempt.mockExam.timeLimit) {
      const deadline = new Date(attempt.startedAt).getTime() + attempt.mockExam.timeLimit * 60_000;
      remainingSeconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
    }

    let practiceTokens = null;
    if (isPractice) {
      const wallet = await getOrCreateWallet(userId);
      practiceTokens = wallet.tokens;
    }

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          mode: attempt.mode,
          status: attempt.status,
          startedAt: attempt.startedAt,
          totalMarks: attempt.totalMarks,
        },
        mockExam: attempt.mockExam,
        questions: questionViews,
        remainingSeconds,
        practiceTokens,
        practiceUnlockCost: attempt.mockExam.practiceUnlockCost,
      },
    });
  } catch (error) {
    console.error("Error fetching mock attempt:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลการทำข้อสอบ" }, { status: 500 });
  }
}
