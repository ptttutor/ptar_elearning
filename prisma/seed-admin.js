// ===== Admin user seed script (independent, run standalone) =====
// Run: node prisma/seed-admin.js
// Idempotent: safe to run repeatedly (upsert by email).
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'tawan-dev-demo@examplemail.com'
  const hashedPassword = await bcrypt.hash('P@ssw0rd', 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email,
      name: 'Tawan Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin user ready: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
