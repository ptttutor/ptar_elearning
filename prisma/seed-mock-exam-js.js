// ===== Demo Mock Exam seed: JavaScript programming (independent, run standalone) =====
// Run: node prisma/seed-mock-exam-js.js
// Idempotent: safe to run repeatedly without creating duplicates.
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const fundamentals = await prisma.mockTopic.upsert({
    where: { subject_name: { subject: 'ComputerScience', name: 'พื้นฐาน JavaScript' } },
    update: {},
    create: { subject: 'ComputerScience', name: 'พื้นฐาน JavaScript' },
  })
  const domAsync = await prisma.mockTopic.upsert({
    where: { subject_name: { subject: 'ComputerScience', name: 'DOM & Async' } },
    update: {},
    create: { subject: 'ComputerScience', name: 'DOM & Async' },
  })

  const examTitle = 'ข้อสอบจำลอง JavaScript ชุดที่ 1'
  let exam = await prisma.mockExam.findFirst({ where: { title: examTitle } })
  if (!exam) {
    exam = await prisma.mockExam.create({
      data: {
        title: examTitle,
        description: 'ข้อสอบจำลองภาษา JavaScript ครอบคลุมพื้นฐานตัวแปร ฟังก์ชัน DOM และ Async พร้อมโหมดฝึกฝนและสอบจริง',
        subject: 'ComputerScience',
        timeLimit: 30,
        passingMarks: 5,
        attemptsAllowed: 1,
        allowPracticeMode: true,
        allowRealMode: true,
        practiceUnlockCost: 1,
        isActive: true,
      },
    })
  }

  const questions = [
    {
      questionText: 'คำสั่งใดใช้ประกาศตัวแปรที่สามารถเปลี่ยนค่าได้ และมีขอบเขตแบบ block scope',
      questionType: 'MULTIPLE_CHOICE',
      topicId: fundamentals.id,
      marks: 1,
      explanation: '`let` ประกาศตัวแปรแบบ block scope และเปลี่ยนค่าได้ ต่างจาก `const` ที่เปลี่ยนค่าไม่ได้ และ `var` ที่เป็น function scope',
      options: [
        { optionText: 'let', isCorrect: true, order: 1 },
        { optionText: 'const', isCorrect: false, order: 2 },
        { optionText: 'var', isCorrect: false, order: 3 },
      ],
    },
    {
      questionText: 'ผลลัพธ์ของ `typeof "10" === 10` คือ true',
      questionType: 'TRUE_FALSE',
      topicId: fundamentals.id,
      marks: 1,
      explanation: '`typeof "10"` คือ `"string"` ไม่เท่ากับตัวเลข 10 และ `===` เทียบทั้งชนิดข้อมูลและค่า จึงได้ false',
      options: [
        { optionText: 'จริง', isCorrect: false, order: 1 },
        { optionText: 'เท็จ', isCorrect: true, order: 2 },
      ],
    },
    {
      questionText: 'เมธอดใดใช้เลือก element ตัวแรกที่ตรงกับ CSS selector บนหน้าเว็บ',
      questionType: 'MULTIPLE_CHOICE',
      topicId: domAsync.id,
      marks: 1,
      explanation: '`document.querySelector(selector)` คืนค่า element ตัวแรกที่ตรงกับ selector ที่ระบุ',
      options: [
        { optionText: 'document.querySelector()', isCorrect: true, order: 1 },
        { optionText: 'document.getElementByName()', isCorrect: false, order: 2 },
        { optionText: 'document.select()', isCorrect: false, order: 3 },
      ],
    },
    {
      questionText: '`Promise` ที่อยู่ในสถานะ pending สามารถเปลี่ยนไปเป็น fulfilled หรือ rejected ได้',
      questionType: 'TRUE_FALSE',
      topicId: domAsync.id,
      marks: 1,
      explanation: 'Promise มี 3 สถานะ: pending, fulfilled, rejected โดย pending จะเปลี่ยนไปเป็นอย่างใดอย่างหนึ่งเมื่องานเสร็จหรือผิดพลาด',
      options: [
        { optionText: 'จริง', isCorrect: true, order: 1 },
        { optionText: 'เท็จ', isCorrect: false, order: 2 },
      ],
    },
    {
      questionText: 'คีย์เวิร์ดใดใช้คู่กับ `async function` เพื่อรอผลลัพธ์ของ Promise ก่อนไปคำสั่งถัดไป',
      questionType: 'SHORT_ANSWER',
      topicId: domAsync.id,
      marks: 2,
      explanation: 'ใช้ `await` หน้า Promise เพื่อหยุดรอผลลัพธ์ภายใน `async function` ก่อนทำงานบรรทัดถัดไป',
      options: [{ optionText: 'await', isCorrect: true, order: 1 }],
    },
  ]

  let created = 0
  for (const q of questions) {
    const exists = await prisma.mockQuestion.findFirst({
      where: { mockExamId: exam.id, questionText: q.questionText },
    })
    if (exists) continue

    const currentMax = await prisma.mockQuestion.aggregate({
      where: { mockExamId: exam.id },
      _max: { order: true },
    })

    await prisma.mockQuestion.create({
      data: {
        mockExamId: exam.id,
        topicId: q.topicId,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        explanation: q.explanation || null,
        order: (currentMax._max.order ?? 0) + 1,
        options: { create: q.options },
      },
    })
    created += 1
  }

  console.log(`✅ JS mock exam seeded: "${examTitle}" (${created} new question(s), ${questions.length} total defined)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
