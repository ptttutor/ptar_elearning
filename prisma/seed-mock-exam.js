// ===== Mock Exam System seed script (independent from Exam/Question) =====
// Run standalone: node prisma/seed-mock-exam.js
// Idempotent: safe to run repeatedly without creating duplicates.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const mechanics = await prisma.mockTopic.upsert({
    where: { subject_name: { subject: 'Physics', name: 'กลศาสตร์' } },
    update: {},
    create: { subject: 'Physics', name: 'กลศาสตร์' },
  });
  const electricity = await prisma.mockTopic.upsert({
    where: { subject_name: { subject: 'Physics', name: 'ไฟฟ้า' } },
    update: {},
    create: { subject: 'Physics', name: 'ไฟฟ้า' },
  });

  const examTitle = 'ข้อสอบจำลอง กลศาสตร์และไฟฟ้า ชุดที่ 1';
  let exam = await prisma.mockExam.findFirst({ where: { title: examTitle } });
  if (!exam) {
    exam = await prisma.mockExam.create({
      data: {
        title: examTitle,
        description: 'ข้อสอบจำลองฟิสิกส์ ครอบคลุมกลศาสตร์และไฟฟ้าเบื้องต้น พร้อมโหมดฝึกฝนและสอบจริง',
        subject: 'Physics',
        gradeLevel: 'SENIOR_HIGH',
        timeLimit: 60,
        passingMarks: 6,
        attemptsAllowed: 1,
        allowPracticeMode: true,
        allowRealMode: true,
        practiceUnlockCost: 1,
        isActive: true,
      },
    });
  }

  const questions = [
    {
      questionText:
        'จากภาพ วัตถุมวล m วางอยู่บนพื้นเอียงลื่น (ไม่มีแรงเสียดทาน) ทำมุม θ กับแนวราบ ความเร่งของวัตถุตามแนวพื้นเอียงมีค่าเท่าใด',
      questionImage: 'https://placehold.co/640x420/e8effd/0046c4?font=roboto&text=Incline+plane%2C+mass+m%2C+angle+%CE%B8',
      questionType: 'MULTIPLE_CHOICE',
      topicId: mechanics.id,
      marks: 2,
      explanation:
        'แตกแรงโน้มถ่วง mg ตามแนวพื้นเอียง จะได้องค์ประกอบ mg sin θ เป็นแรงลัพธ์ในแนวเคลื่อนที่ (ไม่มีแรงเสียดทานมาหักล้าง) ดังนั้น a = g sin θ',
      options: [
        { optionText: 'g sin θ', isCorrect: true, order: 1 },
        { optionText: 'g cos θ', isCorrect: false, order: 2 },
        { optionText: 'g tan θ', isCorrect: false, order: 3 },
        { optionText: 'g', isCorrect: false, order: 4 },
      ],
    },
    {
      questionText: 'หน่วยของแรงในระบบ SI คือหน่วยใด',
      questionType: 'MULTIPLE_CHOICE',
      topicId: mechanics.id,
      marks: 1,
      explanation: 'หน่วยแรงตั้งชื่อตามไอแซก นิวตัน คือ นิวตัน (N)',
      options: [
        { optionText: 'นิวตัน (N)', isCorrect: true, order: 1 },
        { optionText: 'จูล (J)', isCorrect: false, order: 2 },
        { optionText: 'วัตต์ (W)', isCorrect: false, order: 3 },
      ],
    },
    {
      questionText: 'โมเมนตัมรวมของระบบที่ไม่มีแรงภายนอกมากระทำจะมีค่าคงที่ (อนุรักษ์)',
      questionType: 'TRUE_FALSE',
      topicId: mechanics.id,
      marks: 1,
      explanation: 'เป็นไปตามกฎการอนุรักษ์โมเมนตัม เมื่อไม่มีแรงลัพธ์ภายนอกกระทำต่อระบบ',
      options: [
        { optionText: 'จริง', isCorrect: true, order: 1 },
        { optionText: 'เท็จ', isCorrect: false, order: 2 },
      ],
    },
    {
      questionText: 'วัตถุตกอย่างเสรีจากที่สูง 20 เมตร (g = 10 m/s^2) ใช้เวลากี่วินาทีจึงถึงพื้น (ตอบเป็นตัวเลข หน่วยวินาที)',
      questionType: 'SHORT_ANSWER',
      topicId: mechanics.id,
      marks: 2,
      numericTolerance: 0.05,
      explanation: 'จาก h = 1/2 g t^2 → 20 = 1/2(10)t^2 → t^2 = 4 → t = 2 วินาที',
      options: [{ optionText: '2', isCorrect: true, order: 1 }],
    },
    {
      questionText: 'กฎของโอห์ม (Ohm’s Law) กล่าวไว้ว่าอย่างไร',
      questionType: 'MULTIPLE_CHOICE',
      topicId: electricity.id,
      marks: 1,
      explanation: 'V = IR เมื่อ V คือความต่างศักย์ (โวลต์), I คือกระแสไฟฟ้า (แอมแปร์), R คือความต้านทาน (โอห์ม)',
      options: [
        { optionText: 'V = IR', isCorrect: true, order: 1 },
        { optionText: 'V = I/R', isCorrect: false, order: 2 },
        { optionText: 'V = I + R', isCorrect: false, order: 3 },
      ],
    },
    {
      questionText: 'จากวงจรไฟฟ้าในภาพ ตัวต้านทาน R1 และ R2 ต่อกันแบบใด',
      questionImage: 'https://placehold.co/640x420/e8effd/0046c4?font=roboto&text=Circuit%3A+R1+--+R2+in+series',
      questionType: 'MULTIPLE_CHOICE',
      topicId: electricity.id,
      marks: 1,
      explanation:
        'กระแสไฟฟ้ามีเส้นทางให้ไหลผ่าน R1 แล้วต่อไปยัง R2 เพียงเส้นทางเดียว ไม่มีจุดแยกวงจร จึงเป็นการต่อแบบอนุกรม',
      explanationImages: ['https://placehold.co/640x420/fdf1e2/b45400?font=roboto&text=Worked+Solution+p.1'],
      options: [
        { optionText: 'อนุกรม (Series)', isCorrect: true, order: 1 },
        { optionText: 'ขนาน (Parallel)', isCorrect: false, order: 2 },
        { optionText: 'ผสม', isCorrect: false, order: 3 },
      ],
    },
    {
      questionText:
        'ถ้าความต่างศักย์ไฟฟ้าคือ 12 โวลต์ และความต้านทานคือ 4 โอห์ม กระแสไฟฟ้าที่ไหลผ่านมีค่ากี่แอมแปร์ (ตอบเป็นตัวเลข)',
      questionType: 'SHORT_ANSWER',
      topicId: electricity.id,
      marks: 2,
      numericTolerance: 0.1,
      explanation: 'จาก V = IR → I = V/R = 12/4 = 3 แอมแปร์',
      options: [{ optionText: '3', isCorrect: true, order: 1 }],
    },
  ];

  let created = 0;
  for (const q of questions) {
    const exists = await prisma.mockQuestion.findFirst({
      where: { mockExamId: exam.id, questionText: q.questionText },
    });
    if (exists) continue;

    const currentMax = await prisma.mockQuestion.aggregate({
      where: { mockExamId: exam.id },
      _max: { order: true },
    });

    await prisma.mockQuestion.create({
      data: {
        mockExamId: exam.id,
        topicId: q.topicId,
        questionText: q.questionText,
        questionImage: q.questionImage || null,
        questionType: q.questionType,
        marks: q.marks,
        numericTolerance: q.numericTolerance ?? null,
        explanation: q.explanation || null,
        explanationImages: q.explanationImages || [],
        order: (currentMax._max.order ?? 0) + 1,
        options: { create: q.options },
      },
    });
    created += 1;
  }

  console.log(`✅ Mock exam seeded: "${examTitle}" (${created} new question(s), ${questions.length} total defined)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
