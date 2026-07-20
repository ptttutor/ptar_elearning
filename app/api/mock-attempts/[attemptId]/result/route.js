import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

const WEAK_TOPIC_THRESHOLD_PERCENT = 60;

// GET: /api/mock-attempts/[attemptId]/result - full graded review, only
// once the attempt is COMPLETED. Every question is fully revealed here
// regardless of mode (the attempt is over) plus a per-topic breakdown for
// weak-point analysis.
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
      include: { mockExam: { select: { id: true, title: true, subject: true, passingMarks: true } } },
    });
    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ success: false, error: "ไม่พบการทำข้อสอบนี้" }, { status: 404 });
    }
    if (attempt.status !== "COMPLETED") {
      return NextResponse.json({ success: false, error: "การทำข้อสอบนี้ยังไม่เสร็จสิ้น" }, { status: 400 });
    }

    const questions = await prisma.mockQuestion.findMany({
      where: { mockExamId: attempt.mockExamId },
      include: {
        options: { orderBy: { order: "asc" } },
        topic: { select: { id: true, name: true } },
      },
      orderBy: { order: "asc" },
    });

    const answers = await prisma.mockStudentAnswer.findMany({ where: { attemptId } });
    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]));

    const questionReviews = questions.map((q) => {
      const answer = answerByQuestion.get(q.id) || null;
      return {
        id: q.id,
        order: q.order,
        questionText: q.questionText,
        questionImage: q.questionImage,
        questionType: q.questionType,
        marks: q.marks,
        topic: q.topic,
        explanation: q.explanation,
        explanationImages: q.explanationImages,
        options: q.options.map((o) => ({ id: o.id, optionText: o.optionText, isCorrect: o.isCorrect })),
        studentAnswer: answer
          ? {
              optionId: answer.optionId,
              textAnswer: answer.textAnswer,
              isCorrect: answer.isCorrect,
              marksAwarded: answer.marks,
            }
          : null,
      };
    });

    const topicStats = new Map();
    for (const q of questionReviews) {
      if (!q.topic || !q.studentAnswer || q.studentAnswer.isCorrect == null) continue;
      const entry = topicStats.get(q.topic.id) || { topicName: q.topic.name, correct: 0, total: 0 };
      entry.total += 1;
      if (q.studentAnswer.isCorrect) entry.correct += 1;
      topicStats.set(q.topic.id, entry);
    }

    const topicBreakdown = Array.from(topicStats.entries())
      .map(([topicId, { topicName, correct, total }]) => {
        const percent = total > 0 ? (correct / total) * 100 : 0;
        return { topicId, topicName, correct, total, percent, isWeak: percent < WEAK_TOPIC_THRESHOLD_PERCENT };
      })
      .sort((a, b) => a.percent - b.percent);

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          mode: attempt.mode,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          totalMarks: attempt.totalMarks,
          obtainedMarks: attempt.obtainedMarks,
          percentage: attempt.percentage,
          passed: attempt.passed,
        },
        mockExam: attempt.mockExam,
        questions: questionReviews,
        topicBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching mock attempt result:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดผลข้อสอบ" }, { status: 500 });
  }
}
