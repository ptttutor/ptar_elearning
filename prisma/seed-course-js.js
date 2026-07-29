// ===== Demo course seed: JavaScript programming (independent, run standalone) =====
// Run: node prisma/seed-course-js.js
// Idempotent: safe to run repeatedly (upsert by title).
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'khumta15176@gmail.com'

// Big Buck Bunny — Blender Foundation, Creative Commons (CC BY 3.0), used
// here as a real, copyright-safe stand-in video for demo/sample content.
const SAMPLE_VIDEO_URL = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'

const courses = [
  {
    title: 'JavaScript เบื้องต้น (Fundamentals)',
    description:
      'ปูพื้นฐานภาษา JavaScript ตั้งแต่ตัวแปร ชนิดข้อมูล เงื่อนไข ไปจนถึงฟังก์ชันและลูป เหมาะสำหรับผู้เริ่มต้นที่ไม่มีพื้นฐานมาก่อน',
    price: 990,
    discountPrice: 590,
    duration: 6,
    isFree: false,
    isRecommended: true,
    sampleVideo: SAMPLE_VIDEO_URL,
    chapters: [
      {
        title: 'เริ่มต้นกับ JavaScript',
        contents: [
          { title: 'แนะนำคอร์สและเตรียมเครื่องมือ', contentType: 'VIDEO' },
          { title: 'ตัวแปรและชนิดข้อมูล (Variables & Data Types)', contentType: 'VIDEO' },
          { title: 'Operators และเงื่อนไข (if/else, switch)', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'ฟังก์ชันและ Loop',
        contents: [
          { title: 'Function และ Scope', contentType: 'VIDEO' },
          { title: 'Loop: for, while', contentType: 'VIDEO' },
          { title: 'Array เบื้องต้น', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'Object และโครงสร้างข้อมูล',
        contents: [
          { title: 'Object Literal และ Property', contentType: 'VIDEO' },
          { title: 'Array Methods: map, filter, reduce', contentType: 'VIDEO' },
          { title: 'JSON เบื้องต้น', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'โปรเจกต์จบคอร์ส: To-Do List',
        contents: [
          { title: 'วางแผนโปรเจกต์ To-Do List', contentType: 'VIDEO' },
          { title: 'ลงมือเขียนโค้ดจริง', contentType: 'VIDEO' },
          { title: 'สรุปคอร์สและแนวทางต่อยอด', contentType: 'VIDEO' },
        ],
      },
    ],
  },
  {
    title: 'JavaScript ขั้นสูง: DOM & Async',
    description:
      'ต่อยอดจากพื้นฐาน เจาะลึกการจัดการ DOM, Event, และการเขียนโปรแกรมแบบ Asynchronous ด้วย Promise และ Async/Await',
    price: 1490,
    discountPrice: 990,
    duration: 8,
    isFree: false,
    isRecommended: false,
    sampleVideo: SAMPLE_VIDEO_URL,
    chapters: [
      {
        title: 'DOM Manipulation',
        contents: [
          { title: 'เลือก Element ด้วย Selector', contentType: 'VIDEO' },
          { title: 'แก้ไข Content และ Style ผ่าน DOM', contentType: 'VIDEO' },
          { title: 'Event Listener เบื้องต้น', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'Asynchronous JavaScript',
        contents: [
          { title: 'Callback และปัญหา Callback Hell', contentType: 'VIDEO' },
          { title: 'Promise เบื้องต้น', contentType: 'VIDEO' },
          { title: 'Async/Await', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'การเชื่อมต่อ API',
        contents: [
          { title: 'Fetch API เบื้องต้น', contentType: 'VIDEO' },
          { title: 'จัดการ Error จากการเรียก API', contentType: 'VIDEO' },
          { title: 'แสดงผลข้อมูลจาก API บนหน้าเว็บ', contentType: 'VIDEO' },
          { title: 'แบบฝึกหัดท้ายบท', contentType: 'ASSIGNMENT' },
        ],
      },
      {
        title: 'โปรเจกต์จบคอร์ส: Weather App',
        contents: [
          { title: 'วางแผนโปรเจกต์ Weather App', contentType: 'VIDEO' },
          { title: 'ลงมือเขียนโค้ดจริง', contentType: 'VIDEO' },
          { title: 'สรุปคอร์สและแนวทางต่อยอด', contentType: 'VIDEO' },
        ],
      },
    ],
  },
]

async function main() {
  const instructor = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!instructor) {
    throw new Error(`Instructor user not found (${ADMIN_EMAIL}). Run prisma/seed-admin.js first.`)
  }

  let category = await prisma.category.findFirst({ where: { name: 'เขียนโปรแกรม' } })
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'เขียนโปรแกรม', description: 'คอร์สเขียนโปรแกรมและพัฒนาเว็บไซต์' },
    })
  }

  for (const c of courses) {
    let course = await prisma.course.findFirst({ where: { title: c.title } })
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: c.title,
          description: c.description,
          price: c.price,
          discountPrice: c.discountPrice,
          duration: c.duration,
          isFree: c.isFree,
          isRecommended: c.isRecommended,
          sampleVideo: c.sampleVideo,
          status: 'PUBLISHED',
          instructorId: instructor.id,
          categoryId: category.id,
          subject: 'ComputerScience',
        },
      })
      console.log(`✅ Created course: ${course.title}`)
    } else {
      if (course.sampleVideo !== c.sampleVideo) {
        course = await prisma.course.update({ where: { id: course.id }, data: { sampleVideo: c.sampleVideo } })
      }
      console.log(`↷ Course already exists: ${course.title}`)
    }

    let chapterOrder = 1
    for (const ch of c.chapters) {
      let chapter = await prisma.chapter.findFirst({ where: { courseId: course.id, title: ch.title } })
      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: { title: ch.title, order: chapterOrder, courseId: course.id },
        })
      }
      chapterOrder += 1

      let contentOrder = 1
      for (const ct of ch.contents) {
        const contentUrl = ct.contentType === 'VIDEO' ? SAMPLE_VIDEO_URL : '-'
        const existing = await prisma.content.findFirst({ where: { chapterId: chapter.id, title: ct.title } })
        if (!existing) {
          await prisma.content.create({
            data: {
              title: ct.title,
              contentType: ct.contentType,
              contentUrl,
              order: contentOrder,
              chapterId: chapter.id,
            },
          })
        } else if (existing.contentUrl !== contentUrl) {
          await prisma.content.update({ where: { id: existing.id }, data: { contentUrl } })
        }
        contentOrder += 1
      }
    }
  }

  console.log('✅ Demo JavaScript courses seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
