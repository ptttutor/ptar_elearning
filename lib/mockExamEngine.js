import prisma from "@/lib/prisma";

/**
 * Grades one answer against a question's options. Shared by the answer
 * autosave route (grades immediately on save) — submit just sums the
 * already-graded `MockStudentAnswer.marks` rows, it does not re-grade.
 */
export function gradeAnswer(question, options, { optionId, textAnswer }) {
  switch (question.questionType) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      const correct = options.find((o) => o.isCorrect);
      const isCorrect = !!optionId && optionId === correct?.id;
      return { isCorrect, marks: isCorrect ? question.marks : 0 };
    }
    case "SHORT_ANSWER": {
      const correct = options.find((o) => o.isCorrect);
      const given = (textAnswer ?? "").trim();
      if (!correct || !given) {
        return { isCorrect: false, marks: 0 };
      }

      let isCorrect;
      if (question.numericTolerance != null) {
        const givenNum = Number(given);
        const correctNum = Number(correct.optionText);
        isCorrect =
          Number.isFinite(givenNum) &&
          Number.isFinite(correctNum) &&
          Math.abs(givenNum - correctNum) <= question.numericTolerance;
      } else {
        isCorrect = given.toLowerCase() === correct.optionText.trim().toLowerCase();
      }
      return { isCorrect, marks: isCorrect ? question.marks : 0 };
    }
    default:
      return { isCorrect: null, marks: 0 };
  }
}

export async function isQuestionUnlocked(userId, questionId) {
  const unlock = await prisma.mockPracticeUnlock.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });
  return !!unlock;
}

/** Lazily creates a user's global practice-token wallet (default 10) on first touch. */
export async function getOrCreateWallet(userId) {
  return prisma.mockPracticeWallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

/**
 * Whether a user may start a REAL-mode attempt on this exam. Free exams
 * (price 0) need no purchase. Otherwise access comes from either a direct
 * `MockExamPurchase`, or — if the exam is tied to a course — an active
 * enrollment in that course (buying the course also unlocks its mock exams).
 * PRACTICE mode is never gated by this; it only spends practice tokens.
 */
export async function hasMockExamAccess(userId, mockExam) {
  if (!mockExam.price) return true;

  const purchase = await prisma.mockExamPurchase.findUnique({
    where: { userId_mockExamId: { userId, mockExamId: mockExam.id } },
  });
  if (purchase) return true;

  if (mockExam.courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: mockExam.courseId } },
    });
    if (enrollment) return true;
  }

  return false;
}
