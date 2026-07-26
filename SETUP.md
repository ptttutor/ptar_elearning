# คู่มือติดตั้งและปรับแบรนด์ (Template Setup Guide)

เอกสารนี้สำหรับผู้ซื้อเทมเพลตที่ต้องการนำไปติดตั้งและปรับแบรนด์เป็นเว็บไซต์ของตัวเอง
โปรดอ่าน [LICENSE](./LICENSE) ก่อนนำไปใช้งาน

## 1) สิ่งที่ได้รับ

- เว็บไซต์ e-learning ฉบับสมบูรณ์: หน้าแรก, คอร์สเรียน, ระบบจำลองสอบ (mock exam),
  ระบบตะกร้า/ชำระเงิน, e-book, บทความ, โปรไฟล์ผู้เรียน และระบบผู้ดูแล (/admin)
- Tech stack: Next.js 15, React 18, Prisma + PostgreSQL, NextAuth, Tailwind CSS 4, Shadcn/UI
- รองรับทุกวิชา (ไม่ผูกกับวิชาเคมี) — ดู `lib/constants.js` (`SUBJECTS`) สำหรับรายวิชาที่มีอยู่แล้ว

## 2) ติดตั้งเบื้องต้น

```bash
npm install
cp .env.example .env   # แล้วกรอกค่าจริงตามข้อ 3
npx prisma migrate deploy   # หรือ prisma migrate dev สำหรับ dev
npm run db:seed             # สร้างบัญชี admin@ptttutor.com / รหัสผ่าน 123456 (แก้ทันทีหลัง login)
npm run dev
```

## 3) ตัวแปรแวดล้อม (.env)

ดูรายการทั้งหมดใน `.env.example`. สิ่งที่ต้องมีขั้นต่ำเพื่อรันได้:

| ตัวแปร | ใช้ทำอะไร |
|---|---|
| `DATABASE_URL` | Postgres (แนะนำ Supabase/Neon/Railway) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | เซสชันแอดมิน (`openssl rand -base64 32`) |
| `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` | ล็อกอินด้วย LINE (ผู้เรียน) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | ส่งอีเมลแจ้งเตือน (SMTP) |
| `ADMIN_EMAIL` | ปลายทางอีเมลแจ้งเตือนคำสั่งซื้อ/ระบบ |
| ที่เก็บไฟล์ (เลือก 1): `CLOUDINARY_*`, `BLOB_READ_WRITE_TOKEN`, หรือ `R2_*` | อัปโหลดรูป/ไฟล์คอร์ส |
| `EASYSLIP_API_KEY` / `SLIPOK_API_KEY` | ตรวจสลิปโอนเงินอัตโนมัติ (เลือกใช้บริการใดบริการหนึ่ง) |

**ห้าม commit ไฟล์ `.env` จริงเข้า git หรือแนบไปกับการขายต่อเทมเพลตนี้เด็ดขาด**

## 4) ปรับแบรนด์ (สำคัญที่สุด)

ค่าแบรนด์ทั้งหมด (ชื่อสถาบัน, อีเมลติดต่อ, โซเชียล, ที่อยู่, เวลาทำการ) รวมไว้ที่ไฟล์เดียว:

```
lib/site-config.ts
```

แก้ค่าที่นี่ที่เดียว หน้าแรก/footer/navbar/about/terms/privacy/metadata (SEO title/description)
จะอัปเดตตามทั้งหมด **ไม่ต้องไล่แก้ทีละไฟล์**

ไฟล์รูปภาพที่ต้องเปลี่ยนเองเพราะเป็นรูปเฉพาะของเจ้าของเดิม (อยู่ใน `public/`):

- `new-logo.png` — โลโก้ (navbar/footer/favicon)
- `profile_about.png`, `teacher-tar.JPG`, `teacher1.png`, `teacher(1).png` — รูปผู้สอนหน้า About
- `line-qr.png` / `line-qr.jpg` — QR LINE OA
- `kbank-logo.png` — โลโก้ธนาคารหน้าโอนเงิน (เปลี่ยนตามธนาคารจริงของคุณ)

สี/ธีมของเว็บไซต์อยู่ใน `styles/` และ `tailwind.config.js` (ดู `THEME.md` ประกอบ)

## 5) วิชา/หมวดหมู่คอร์ส

ระบบรองรับทุกวิชาอยู่แล้วผ่าน `lib/constants.js` (`SUBJECTS`, `GRADE_LEVELS`) และ Prisma schema
แต่หน้า Landing page ของคอร์สบางหน้าใน `app/courses/*` (เช่น `chemistry-olympiad-course`,
`netsat-course`) เป็นตัวอย่างหน้าการตลาดเฉพาะคอร์สของเจ้าของเดิม — เขียนเนื้อหาใหม่ตามคอร์ส
จริงของคุณ หรือลบหน้าที่ไม่ใช้ทิ้งได้เลย โครงสร้างข้อมูล (database, API) ไม่ผูกกับวิชาใดวิชาหนึ่ง

## 6) ระบบผู้ดูแล (Admin)

เข้าที่ `/admin` หลัง seed ฐานข้อมูล ล็อกอินด้วย `admin@ptttutor.com` / `123456`
**เปลี่ยนอีเมลและรหัสผ่านทันที** ก่อนใช้งานจริง (แก้ได้ผ่านหน้า admin หรือแก้ค่าใน `prisma/seed.js`
ก่อนรัน seed ครั้งแรก)

## 7) Deploy

โปรเจกต์นี้ทดสอบกับ Vercel เป็นหลัก (มี `vercel.json`) — ตั้งค่า environment variables ในข้อ 3
บน Vercel Dashboard แล้ว deploy ได้ทันที ฐานข้อมูลแนะนำใช้ Postgres แบบ managed (Supabase/Neon)

## 8) ใบอนุญาต

เทมเพลตนี้จำหน่ายภายใต้ [Commercial Template License](./LICENSE) — ใช้ได้ 1 โปรเจกต์ต่อ 1 ใบอนุญาต
ห้ามนำซอร์สโค้ดไปขายต่อเป็นเทมเพลต ติดต่อผู้ขายหากต้องการใบอนุญาตหลายเว็บไซต์/เอเจนซี่
