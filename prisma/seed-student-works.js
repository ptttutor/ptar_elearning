// ===== Student works seed (independent, run standalone) =====
// Seeds a PostType "ผลงานนักเรียน" + one Post so /student-works has real
// content instead of falling back to the static placeholder images.
// Run: node prisma/seed-student-works.js
// Idempotent: safe to run repeatedly (upsert by title within the post type).
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'khumta15176@gmail.com'

const works = [
  {
    title: 'โปรเจกต์ Smart Campus Hub',
    excerpt: 'แอปพลิเคชันรวมฟีเจอร์สำหรับนักศึกษา ผลงานจากคอร์สเขียนโปรแกรม JavaScript',
    imageUrl: '/student-work-smart-campus-hub.jpg',
  },
]

async function main() {
  const author = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!author) {
    throw new Error(`Author user not found (${ADMIN_EMAIL}). Run prisma/seed-admin.js first.`)
  }

  let postType = await prisma.postType.findUnique({ where: { name: 'ผลงานนักเรียน' } })
  if (!postType) {
    postType = await prisma.postType.create({
      data: { name: 'ผลงานนักเรียน', description: 'ผลงาน/โปรเจกต์ของนักเรียนที่เรียนจบคอร์ส', isActive: true },
    })
  }

  for (const w of works) {
    const exists = await prisma.post.findFirst({ where: { postTypeId: postType.id, title: w.title } })
    if (exists) {
      console.log(`↷ Student work already exists: ${w.title}`)
      continue
    }
    await prisma.post.create({
      data: {
        title: w.title,
        excerpt: w.excerpt,
        imageUrl: w.imageUrl,
        imageUrlMobileMode: w.imageUrl,
        isActive: true,
        isFeatured: true,
        publishedAt: new Date(),
        authorId: author.id,
        postTypeId: postType.id,
      },
    })
    console.log(`✅ Created student work: ${w.title}`)
  }

  console.log('✅ Student works seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
