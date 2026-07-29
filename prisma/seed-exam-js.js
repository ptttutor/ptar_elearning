// ===== Demo course exam seed: JavaScript courses (independent, run standalone) =====
// Seeds a per-course quiz (Exam/Question) for the 2 JS demo courses created by
// prisma/seed-course-js.js — this is the "แบบทดสอบ" a student sees under
// /profile/my-courses/course/[id]/exams after enrolling, distinct from the
// standalone Mock Exam system seeded by prisma/seed-mock-exam-js.js.
// Run: node prisma/seed-exam-js.js
// Idempotent: safe to run repeatedly (upsert by title within each course).
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const exams = [
  {
    courseTitle: 'JavaScript เบื้องต้น (Fundamentals)',
    examTitle: 'แบบทดสอบท้ายคอร์ส: JavaScript เบื้องต้น',
    description: 'ทดสอบความเข้าใจตัวแปร เงื่อนไข ฟังก์ชัน ลูป และ Object เบื้องต้น',
    examType: 'POSTTEST',
    timeLimit: 20,
    passingMarks: 5,
    questions: [
      {
        questionText: 'ตัวแปรที่ประกาศด้วย `const` สามารถกำหนดค่าใหม่ให้ตัวแปรนั้นได้ภายหลัง',
        questionType: 'TRUE_FALSE',
        marks: 1,
        explanation: '`const` กำหนดค่าใหม่ให้ตัวแปรไม่ได้ (แก้ค่าภายใน object/array ที่ const อ้างอิงอยู่ได้ แต่ตัวแปรเองแก้ไม่ได้)',
        options: [
          { optionText: 'จริง', isCorrect: false, order: 1 },
          { optionText: 'เท็จ', isCorrect: true, order: 2 },
        ],
      },
      {
        questionText: 'เมธอดใดของ Array ใช้แปลงข้อมูลแต่ละตัวแล้วคืนอาเรย์ใหม่ที่มีความยาวเท่าเดิม',
        questionType: 'MULTIPLE_CHOICE',
        marks: 1,
        explanation: '`map()` วนทุก element แล้วคืนอาเรย์ใหม่ที่มีจำนวนสมาชิกเท่าเดิม ต่างจาก `filter()` ที่คัดกรองสมาชิกออก',
        options: [
          { optionText: 'map()', isCorrect: true, order: 1 },
          { optionText: 'filter()', isCorrect: false, order: 2 },
          { optionText: 'forEach()', isCorrect: false, order: 3 },
        ],
      },
      {
        questionText: 'ลูป `for` ต้องมี 3 ส่วนคือ initialization, condition และ final-expression',
        questionType: 'TRUE_FALSE',
        marks: 1,
        explanation: 'รูปแบบมาตรฐานของ `for` คือ `for (initialization; condition; final-expression) { ... }`',
        options: [
          { optionText: 'จริง', isCorrect: true, order: 1 },
          { optionText: 'เท็จ', isCorrect: false, order: 2 },
        ],
      },
      {
        questionText: 'รูปแบบข้อมูลที่ใช้ key-value คู่กัน คล้าย Object ของ JavaScript และนิยมใช้รับส่งข้อมูลผ่าน API เรียกว่าอะไร (ตอบเป็นตัวย่อ 4 ตัวอักษร)',
        questionType: 'SHORT_ANSWER',
        marks: 2,
        explanation: 'JSON (JavaScript Object Notation) เป็นรูปแบบข้อมูล key-value ที่นิยมใช้รับส่งข้อมูลผ่าน API',
        options: [{ optionText: 'JSON', isCorrect: true, order: 1 }],
      },
    ],
  },
  {
    courseTitle: 'JavaScript ขั้นสูง: DOM & Async',
    examTitle: 'แบบทดสอบท้ายคอร์ส: JavaScript ขั้นสูง',
    description: 'ทดสอบความเข้าใจ DOM Manipulation, Event, Promise, Async/Await และ Fetch API',
    examType: 'POSTTEST',
    timeLimit: 20,
    passingMarks: 5,
    questions: [
      {
        questionText: 'เมธอดใดใช้เพิ่ม event listener ให้กับ element บนหน้าเว็บ',
        questionType: 'MULTIPLE_CHOICE',
        marks: 1,
        explanation: '`element.addEventListener(event, handler)` คือวิธีมาตรฐานในการผูก event handler กับ element',
        options: [
          { optionText: 'element.addEventListener()', isCorrect: true, order: 1 },
          { optionText: 'element.onEvent()', isCorrect: false, order: 2 },
          { optionText: 'element.bind()', isCorrect: false, order: 3 },
        ],
      },
      {
        questionText: '`fetch()` คืนค่ากลับมาเป็น Promise เสมอ',
        questionType: 'TRUE_FALSE',
        marks: 1,
        explanation: '`fetch()` คืนค่าเป็น Promise ที่ resolve เป็น Response object เสมอ ไม่ว่าจะสำเร็จหรือ error ทาง network',
        options: [
          { optionText: 'จริง', isCorrect: true, order: 1 },
          { optionText: 'เท็จ', isCorrect: false, order: 2 },
        ],
      },
      {
        questionText: 'ฟังก์ชันที่ประกาศด้วยคีย์เวิร์ดใดจึงจะสามารถใช้ `await` ภายในฟังก์ชันนั้นได้',
        questionType: 'SHORT_ANSWER',
        marks: 2,
        explanation: 'ต้องประกาศฟังก์ชันด้วยคีย์เวิร์ด `async` เช่น `async function() {}` จึงจะใช้ `await` ภายในได้',
        options: [{ optionText: 'async', isCorrect: true, order: 1 }],
      },
      {
        questionText: 'try/catch สามารถใช้ดักจับ error จากโค้ดภายใน `async function` ที่ใช้ `await` ได้',
        questionType: 'TRUE_FALSE',
        marks: 1,
        explanation: 'try/catch ใช้ดักจับ rejected Promise จาก await ได้ตามปกติ เหมือนดักจับ exception ทั่วไป',
        options: [
          { optionText: 'จริง', isCorrect: true, order: 1 },
          { optionText: 'เท็จ', isCorrect: false, order: 2 },
        ],
      },
    ],
  },
]

async function main() {
  for (const e of exams) {
    const course = await prisma.course.findFirst({ where: { title: e.courseTitle } })
    if (!course) {
      console.log(`⚠ Skipped "${e.examTitle}" — course not found: ${e.courseTitle} (run prisma/seed-course-js.js first)`)
      continue
    }

    let exam = await prisma.exam.findFirst({ where: { courseId: course.id, title: e.examTitle } })
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          title: e.examTitle,
          description: e.description,
          courseId: course.id,
          examType: e.examType,
          timeLimit: e.timeLimit,
          totalMarks: e.questions.reduce((sum, q) => sum + q.marks, 0),
          passingMarks: e.passingMarks,
          isActive: true,
        },
      })
      console.log(`✅ Created exam: ${exam.title}`)
    } else {
      console.log(`↷ Exam already exists: ${exam.title}`)
    }

    let created = 0
    for (const q of e.questions) {
      const exists = await prisma.question.findFirst({ where: { examId: exam.id, questionText: q.questionText } })
      if (exists) continue
      await prisma.question.create({
        data: {
          examId: exam.id,
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks,
          explanation: q.explanation || null,
          options: { create: q.options },
        },
      })
      created += 1
    }
    console.log(`   ${created} new question(s), ${e.questions.length} total defined`)
  }

  console.log('✅ Demo JavaScript course exams seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
