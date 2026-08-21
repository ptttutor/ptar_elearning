// Shared between app/api/admin/flashcards/route.js and [id]/route.js.
// Kept out of the route files themselves — Next.js route handlers should
// only export HTTP method functions (plus a few reserved config exports),
// not arbitrary helpers.

export const CARD_INCLUDE = {
  options: { orderBy: { order: "asc" } },
};

export function validateAnswerModeFields({ answerMode, options, acceptedAnswers }) {
  if (answerMode === "MULTIPLE_CHOICE") {
    if (!options || options.length < 2) {
      return "กรุณาเพิ่มตัวเลือกอย่างน้อย 2 ตัวเลือก";
    }
    if (!options.some((o) => o.isCorrect)) {
      return "กรุณาเลือกคำตอบที่ถูกต้องอย่างน้อย 1 ตัวเลือก";
    }
  } else if (answerMode === "TYPED") {
    if (!acceptedAnswers || acceptedAnswers.filter((a) => a && a.trim()).length === 0) {
      return "กรุณากรอกคำตอบที่ยอมรับได้อย่างน้อย 1 แบบ";
    }
  }
  return null;
}
