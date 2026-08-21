# แผนพัฒนา: Flashcard Management + Spaced Repetition (SM-2)

เอกสารนี้คือแผนสำหรับเพิ่มระบบ Flashcard เข้า `ptar_elearning` โดยยึดสถาปัตยกรรมและ pattern ที่มีอยู่แล้วในรีโปเป็นหลัก

---

## 1. บริบทและข้อสรุปการออกแบบ

### สิ่งที่รีโปนี้มีอยู่แล้ว (สำรวจจริงจากโค้ด)

- **Stack**: Next.js 15 App Router, Prisma 6.19 + PostgreSQL, NextAuth v4 (JWT + role)
- **Admin**: `app/admin/(dashboard)/**` ใช้ Ant Design, ป้องกันด้วย `middleware.ts` (`role === "ADMIN"`) + `requireAdmin()` ใน API ทุกเส้น
- **Pattern ที่ใช้ซ้ำได้ทันที**:
  - `hooks/admin/useAdminListState.js` — state กลางของหน้า list (search debounce + filter + sort + pagination)
  - `components/admin/shared/` — `AdminPageHeader`, `AdminFilterBar`, `SortableTableHead`, `AdminPagination`, `ResultsCount`, `AdminStatsCard`
  - โครงต่อ resource: `components/admin/<resource>/{index,XxxFilters,XxxTable,XxxModal,DeleteModal}.js`
  - โครง API: `app/api/admin/<resource>/route.js` (GET list + POST) และ `[id]/route.js` (GET/PUT/DELETE)

### ข้อสรุป: แยกเป็น feature อิสระ แต่ผูก taxonomy กับ `MockTopic`

> **หมายเหตุ — แก้จากที่คุยกันไว้ตอนแรก**
> ตอนแรกผมเสนอให้ผูกกับ `Category` แต่พออ่าน schema จริงพบว่า `Category` มีแค่
> `id / name / description` และผูกกับ `Course[]` อย่างเดียว **ไม่มี `subject`** — บางเกินกว่าจะใช้จัดหมวดวิชาได้
> ส่วน `MockTopic` มี `subject Subjects` + `@@unique([subject, name])` และเป็น taxonomy ที่ `MockQuestion` ใช้อยู่จริง
> จึงเหมาะกว่ามาก

**การผูกที่เลือก** — `FlashcardDeck` มี 2 ฟิลด์:

| ฟิลด์ | ชนิด | เหตุผล |
|---|---|---|
| `subject` | `Subjects` (required) | เป็นของตัวเอง ไม่ต้องพึ่ง mock exam — deck ยืนอยู่ได้เอง (เลียนแบบ `MockExam.subject`) |
| `topicId` | `String?` → `MockTopic` | ผูกแบบหลวม ๆ ไว้ทำ "ทบทวนหัวข้อที่อ่อน" หลังทำ mock exam ได้ แต่ deck ที่ไม่เกี่ยว mock exam ก็ปล่อย null ได้ |

ผลลัพธ์: Flashcard เป็น feature อิสระเต็มตัว (มีหน้าเมนู, admin, การใช้งานของตัวเอง) แต่ยัง **เชื่อมกับ mock exam ได้โดยไม่ต้อง coupling แน่น** — หน้า result ของ mock exam แนะนำ deck ได้ด้วยการ match `topicId` ตรง ๆ หรือ fallback เป็น `subject`

---

## 2. Prisma Schema ที่ต้องเพิ่ม

เพิ่มใน `prisma/schema.prisma`

### 2.1 โมเดลหลัก

```prisma
model FlashcardDeck {
  id            String      @id @default(uuid())
  title         String
  description   String?
  subject       Subjects
  gradeLevel    GradeLevel?
  topicId       String?     // ผูกหลวม ๆ กับ MockTopic (optional)
  coverImageUrl String?
  isActive      Boolean     @default(true)
  order         Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  topic MockTopic?  @relation(fields: [topicId], references: [id])
  cards Flashcard[]

  @@index([subject])
  @@index([topicId])
}

model Flashcard {
  id         String   @id @default(uuid())
  deckId     String
  front      String   @db.Text  // คำถาม / ด้านหน้า
  frontImage String?
  back       String   @db.Text  // คำตอบ / ด้านหลัง
  backImage  String?
  hint       String?
  order      Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // --- รูปแบบการตอบ (ดู §3) ---
  answerMode       FlashcardAnswerMode @default(SELF_GRADE)
  acceptedAnswers  String[]            @default([])  // TYPED: คำตอบที่ยอมรับได้หลายแบบ
  numericTolerance Float?                            // TYPED: ถ้าเป็นตัวเลข ยอมคลาดเคลื่อนเท่าไร
                                                     // (ยืม pattern จาก MockQuestion.numericTolerance)

  deck    FlashcardDeck        @relation(fields: [deckId], references: [id], onDelete: Cascade)
  options FlashcardOption[]    // MULTIPLE_CHOICE เท่านั้น
  reviews FlashcardReview[]
  logs    FlashcardReviewLog[]

  @@index([deckId])
}

enum FlashcardAnswerMode {
  SELF_GRADE      // พลิกการ์ดแล้วให้คะแนนตัวเอง (ค่าเริ่มต้น)
  MULTIPLE_CHOICE // เลือก ก ข ค ง
  TYPED           // พิมพ์คำตอบลงการ์ด
}

// โครงเดียวกับ MockQuestionOption เป๊ะ — reuse pattern เดิมของรีโป
model FlashcardOption {
  id         String  @id @default(uuid())
  cardId     String
  optionText String
  isCorrect  Boolean @default(false)
  order      Int     @default(0)

  card Flashcard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
}
```

### 2.2 สถานะ SRS ต่อ user ต่อการ์ด (หัวใจของ SM-2)

```prisma
model FlashcardReview {
  id             String          @id @default(uuid())
  userId         String
  cardId         String
  repetitions    Int             @default(0)    // n — จำนวนครั้งที่ตอบถูกติดกัน
  easeFactor     Float           @default(2.5)  // EF — ขั้นต่ำ 1.3
  interval       Int             @default(0)    // วัน
  nextReviewAt   DateTime        @default(now())
  lastReviewedAt DateTime?
  lapses         Int             @default(0)    // จำนวนครั้งที่ลืม (q < 3)
  status         FlashcardStatus @default(NEW)

  user User      @relation(fields: [userId], references: [id])
  card Flashcard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@unique([userId, cardId])
  @@index([userId, nextReviewAt])   // index สำคัญ — ใช้ query "การ์ดที่ถึงกำหนดทบทวน"
}

enum FlashcardStatus {
  NEW
  LEARNING
  REVIEW
  RELEARNING
}
```

### 2.3 ประวัติการทบทวน (สำหรับสถิติ + admin analytics)

```prisma
model FlashcardReviewLog {
  id              String   @id @default(uuid())
  userId          String
  cardId          String
  grade           Int      // 0-5 ตาม SM-2
  intervalBefore  Int
  intervalAfter   Int
  easeFactorAfter Float
  reviewedAt      DateTime @default(now())

  // บริบทของการตอบ — ไว้ดูว่านักเรียนพิมพ์ผิดแบบไหนบ่อย / ตัวลวงข้อไหนกินคนเยอะ
  answerMode FlashcardAnswerMode
  userAnswer String?  // สิ่งที่พิมพ์ หรือ optionId ที่เลือก
  wasCorrect Boolean? // null เมื่อเป็น SELF_GRADE (ไม่มีเฉลยเชิงระบบ)

  user User      @relation(fields: [userId], references: [id])
  card Flashcard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([userId, reviewedAt])
  @@index([cardId])
}
```

> `FlashcardReviewLog` เป็นตาราง append-only ที่โตเร็ว แต่จำเป็นถ้าอยากได้ streak / สถิติรายวัน / รู้ว่าการ์ดใบไหนยากที่สุด
> ถ้าอยากลดขอบเขต Phase 1 ตัดออกได้ แล้วค่อยเพิ่มทีหลัง (แต่จะไม่มีข้อมูลย้อนหลัง)

### 2.4 แก้โมเดลเดิม (เพิ่ม relation ปลายทาง)

```prisma
model User {
  // ... ของเดิม
  flashcardReviews    FlashcardReview[]
  flashcardReviewLogs FlashcardReviewLog[]
}

model MockTopic {
  // ... ของเดิม
  flashcardDecks FlashcardDeck[]
}
```

---

## 3. อัลกอริทึม SM-2 (`lib/sm2.js`)

แยกเป็นฟังก์ชัน **pure** ไม่แตะ DB เลย เพื่อให้เขียนเทสต์ได้ง่ายและ logic ไม่กระจาย

```js
// grade (q): 0-5
//   0-2 = ตอบผิด/ลืม  →  reset
//   3   = ถูกแบบยาก
//   4   = ถูกปกติ
//   5   = ถูกแบบง่ายมาก
export function sm2({ repetitions, easeFactor, interval }, grade) { ... }
```

**กติกา**

1. ถ้า `grade >= 3` (จำได้)
   - `repetitions === 0` → `interval = 1`
   - `repetitions === 1` → `interval = 6`
   - นอกนั้น → `interval = Math.round(interval * easeFactor)`
   - `repetitions += 1`
2. ถ้า `grade < 3` (ลืม) → `repetitions = 0`, `interval = 1`, `lapses += 1`
3. ปรับ EF ทุกครั้ง:
   `EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))` และ **บังคับขั้นต่ำ 1.3**
4. `nextReviewAt = now + interval วัน`

**การ map ปุ่มบน UI → grade** (ให้นักเรียนเห็นแค่ 4 ปุ่ม ไม่ต้องเห็นเลข 0-5)

| ปุ่ม | grade |
|---|---|
| ลืม / ทบทวนใหม่ | 0 |
| ยาก | 3 |
| จำได้ | 4 |
| ง่าย | 5 |

### 3.1 แต่ละโหมดการตอบ → grade

หัวใจคือ **ทุกโหมดต้องแปลงกลับมาเป็นเลข 0-5 ให้ได้** เพราะ SM-2 กินแค่ค่านี้ค่าเดียว

| โหมด | ผลลัพธ์ | grade |
|---|---|---|
| `SELF_GRADE` | นักเรียนกดเลือกเอง | 0 / 3 / 4 / 5 |
| `MULTIPLE_CHOICE` | ตอบผิด | 0 |
| | ตอบถูก | 4 |
| `TYPED` | ตอบผิด | 0 |
| | ถูกแต่สะกดเพี้ยนเล็กน้อย (Levenshtein ≤ 2) | 3 |
| | ถูกเป๊ะ / อยู่ใน `acceptedAnswers` / ตัวเลขอยู่ใน `numericTolerance` | 4 |

**ข้อควรระวัง — โหมดอัตโนมัติทำให้ SM-2 หยาบลง**
`SELF_GRADE` ให้ค่าครบ 4 ระดับ แต่ MC/TYPED ให้แค่ 0 กับ 4 เป็นหลัก ทำให้ `easeFactor` แทบไม่ขยับ
ระยะทบทวนเลยโตแบบเดิม ๆ ไม่ปรับตามความยากของการ์ดจริง

**ทางแก้ที่แนะนำ** — หลังระบบเฉลยว่าถูก/ผิดแล้ว ให้โชว์ปุ่ม **ยาก / จำได้ / ง่าย** ต่ออีกชั้น (ข้ามได้)
นักเรียนที่อยากปรับก็กด ไม่กดก็ใช้ค่า default (4) — ได้ทั้งความเร็วและความละเอียด

### 3.2 การปัดการ์ด (swipe)

ปัดซ้าย/ขวาอย่างเดียวจะเหลือแค่ 2 ระดับ (0 กับ 4) ซึ่งเจอปัญหาเดียวกับข้างบน
เสนอให้ใช้ **4 ทิศ = 4 ปุ่ม** ครบพอดี ไม่เสียความละเอียดของ SM-2 เลย

| ท่าทาง | grade | ความหมาย |
|---|---|---|
| ปัดซ้าย ← | 0 | ลืม |
| ปัดลง ↓ | 3 | ยาก |
| ปัดขวา → | 4 | จำได้ |
| ปัดขึ้น ↑ | 5 | ง่าย |

ข้อควรระวังตอน implement:
- ต้องใส่ `touch-action: none` บนตัวการ์ด ไม่งั้นปัดขึ้น/ลงจะไปโดน scroll ของหน้าจอแทน
- ต้องมี feedback ระหว่างลาก (เงาสี + ป้ายบอกว่ากำลังจะได้ grade ไหน) ไม่งั้นนักเรียนจะปัดผิดโดยไม่รู้ตัว
- ตั้ง threshold ระยะลาก (เช่น 25% ของความกว้างการ์ด) ถ้าไม่ถึงให้ดีดกลับ
- ปุ่ม 4 ปุ่มต้องคงไว้เสมอ — swipe เป็นทางลัด ไม่ใช่ทางเดียว (เดสก์ท็อป + accessibility)

`swipe` เป็นเรื่องฝั่ง frontend ล้วน **ไม่กระทบ schema** — สุดท้ายมันก็ยิง grade ตัวเดียวกันเข้า API เส้นเดิม

---

## 4. Admin Backoffice

ทำตาม pattern ของ `mock-exams` + `mock-topics` ทุกประการ (Ant Design, `useAdminListState`, shared components)

### 4.1 Deck (หน้าหลัก)

| ไฟล์ | หน้าที่ |
|---|---|
| `app/admin/(dashboard)/flashcard-decks/page.js` | wrapper บาง ๆ |
| `components/admin/flashcard-decks/index.js` | ประกอบหน้า + จัดการ modal state |
| `components/admin/flashcard-decks/DeckFilters.js` | ค้นหา + กรอง subject / gradeLevel / topic / isActive |
| `components/admin/flashcard-decks/DeckTable.js` | ตาราง + ปุ่ม "จัดการการ์ด" |
| `components/admin/flashcard-decks/DeckModal.js` | ฟอร์มสร้าง/แก้ไข |
| `components/admin/flashcard-decks/DeleteModal.js` | ยืนยันลบ |
| `hooks/admin/useFlashcardDecks.js` | fetcher + `useAdminListState` + โหลด MockTopic มาทำ dropdown |
| `app/api/admin/flashcard-decks/route.js` | GET (filter/sort/pagination) + POST |
| `app/api/admin/flashcard-decks/[id]/route.js` | GET / PUT / DELETE |

**DELETE guard**: บล็อกถ้ามี `FlashcardReview` ของ deck นั้นอยู่แล้ว (มีคนเริ่มท่องแล้ว) — เพื่อไม่ให้ประวัติการเรียนของนักเรียนหาย
ให้ใช้ soft-delete (`isActive = false`) แทน วิธีนี้ตรงกับที่ `courses` guard ด้วย enrollments อยู่แล้ว

### 4.2 การ์ดในแต่ละ Deck

เลียนแบบ `app/admin/(dashboard)/mock-exams/questions/[mockExamId]/page.js`

| ไฟล์ | หน้าที่ |
|---|---|
| `app/admin/(dashboard)/flashcard-decks/cards/[deckId]/page.js` | หน้าจัดการการ์ดของ deck |
| `components/admin/flashcards/{index,CardTable,CardModal,DeleteModal}.js` | CRUD การ์ด |
| `hooks/admin/useFlashcards.js` | โหลดการ์ดตาม `deckId` |
| `app/api/admin/flashcards/route.js` | GET (ตาม `deckId`) + POST |
| `app/api/admin/flashcards/[id]/route.js` | PUT / DELETE |

**ฟีเจอร์ที่ควรมีในหน้านี้**
- เรียงลำดับการ์ด (`order`) — ปรับได้ด้วยปุ่มขึ้น/ลง (drag-and-drop เก็บไว้ทีหลัง)
- ปุ่ม **นำเข้าเป็นชุด (bulk import)** — วาง CSV / ข้อความคั่นด้วย tab (`front <TAB> back` บรรทัดละใบ) แล้วสร้างทีเดียว
  → อันนี้สำคัญมากเชิงใช้งานจริง เพราะ flashcard มักมีหลักร้อยใบต่อ deck การกรอกทีละใบไม่ไหว
  → รองรับได้เฉพาะ `SELF_GRADE` เท่านั้น (MC ต้องกรอกตัวเลือกทีละใบอยู่ดี)

**ฟอร์มการ์ดต้องเปลี่ยนตาม `answerMode`** (ใช้ `Form.Item shouldUpdate` ของ AntD)
- `SELF_GRADE` — แค่ front / back / รูป / hint
- `MULTIPLE_CHOICE` — เพิ่มตารางตัวเลือก (เพิ่ม/ลบแถวได้, ติ๊กข้อถูก) — ยก UI จาก `components/admin/mock-exam-questions` มาได้เกือบทั้งดุ้น
- `TYPED` — เพิ่ม `acceptedAnswers` (หลายคำตอบ) + `numericTolerance`

**อัปโหลดรูป** — ใช้ `app/api/upload-blob` ที่มีอยู่แล้วในรีโป ไม่ต้องทำใหม่

### 4.3 เมนู

เพิ่มใน `components/admin/AdminSidebar.js` (array `menuItems`) ต่อจาก `mock-topics`:

```js
{ key: "/admin/flashcard-decks", label: "แฟลชการ์ด", icon: Layers },
```

---

## 5. ฝั่งนักเรียน

| Route | หน้าที่ |
|---|---|
| `app/flashcards/page.js` | รายการ deck + ตัวกรองวิชา + badge "ถึงกำหนดทบทวน N ใบ" ต่อ deck |
| `app/flashcards/[deckId]/page.js` | หน้าท่อง — พลิกการ์ด + ปุ่มให้คะแนน 4 ปุ่ม |

| API | หน้าที่ |
|---|---|
| `app/api/flashcards/decks/route.js` | GET รายการ deck (`isActive`) + นับการ์ดที่ถึงกำหนดของ user |
| `app/api/flashcards/study/[deckId]/route.js` | GET คิวการ์ดของรอบนี้ |
| `app/api/flashcards/review/route.js` | POST บันทึกผล 1 ใบ (คำนวณ SM-2 + upsert + เขียน log) |
| `app/api/flashcards/stats/route.js` | GET สถิติ (ทบทวนวันนี้, streak, กราฟ 30 วัน) |

### ตรรกะการสร้างคิว (`study/[deckId]`)

1. การ์ดที่ **ถึงกำหนดแล้ว** — `nextReviewAt <= now` เรียงตาม `nextReviewAt` เก่าสุดก่อน
2. เติมด้วยการ์ด **ใหม่** ที่ยังไม่มี `FlashcardReview` เลย — จำกัดจำนวนต่อวัน (เช่น 20 ใบ) กันนักเรียนเปิดการ์ดใหม่รัวจนพรุ่งนี้ท่วม
3. ส่งกลับพร้อม `total`, `dueCount`, `newCount`

### การบันทึกผล (`review`)

- ดึง `userId` จาก session (**ห้ามรับจาก body**)
- ตรวจว่า `cardId` อยู่ใน deck ที่ `isActive` จริง
- `sm2()` → `prisma.$transaction([upsert FlashcardReview, create FlashcardReviewLog])`
- ตอบกลับสถานะใหม่ + `nextReviewAt` เพื่อให้ UI โชว์ "เจอกันอีกครั้งใน X วัน"

---

## 6. เชื่อมกับ Mock Exam (ทำทีหลังได้ ไม่บล็อก Phase 1)

หน้าผลสอบ mock exam: จากคำตอบที่ผิด → รวบ `MockQuestion.topicId` ที่พลาดบ่อย → หา `FlashcardDeck` ที่ `topicId` ตรงกัน (ถ้าไม่เจอ fallback ที่ `subject`) → แสดงการ์ด "ทบทวนหัวข้อนี้ด้วยแฟลชการ์ด"

ทำได้โดย**ไม่ต้องแก้ schema ของ mock exam เลย** เพราะ `MockQuestion.topicId` มีอยู่แล้ว

---

## 7. ลำดับการทำ

**Phase 1 — แกนหลัก**
1. เพิ่ม schema (§2) + `npx prisma validate` → `npx prisma migrate dev`
2. `lib/sm2.js` + เทสต์ของอัลกอริทึม
3. Admin CRUD: deck → การ์ด (§4.1, §4.2) + เมนู sidebar
4. bulk import การ์ด

**Phase 2 — ฝั่งนักเรียน**
5. API: decks / study / review (§5)
6. หน้ารายการ deck + หน้าท่องการ์ด (พลิกการ์ด + 4 ปุ่ม)

**Phase 3 — ต่อยอด**
7. สถิติ + streak + กราฟย้อนหลัง
8. เชื่อมกับหน้าผลสอบ mock exam (§6)
9. Admin analytics: การ์ดที่คนลืมบ่อยที่สุด (จาก `lapses` / log)

---

## 8. เรื่องที่ยังต้องตัดสินใจ

1. **Deck ฟรีหรือขาย?** — ตอนนี้แผนนี้ให้ฟรีทั้งหมด (คุมด้วย `isActive`)
   ถ้าจะขาย ต้องเพิ่ม `price` + ผูก `OrderItem` / entitlement แบบ `MockExam` ซึ่งเพิ่มงานอีกพอควร
2. **จำกัดการ์ดใหม่ต่อวัน** — ตั้ง fix 20 ใบ หรือให้ตั้งค่าต่อ deck / ต่อ user
3. **`FlashcardReviewLog` เอาตั้งแต่ Phase 1 ไหม** — ถ้าตัดออกจะไม่มีข้อมูลย้อนหลังทำ streak/กราฟทีหลัง
4. **สอบถามเรื่อง timezone** — "ถึงกำหนดวันนี้" ควรตัดที่เที่ยงคืนเวลาไทย (`Asia/Bangkok`) ไม่ใช่ UTC ไม่งั้นนักเรียนจะเห็นการ์ดเด้งผิดวัน
5. **โหมด MC/TYPED — ให้กดปรับ ยาก/ง่าย ต่อไหม** (§3.1) ถ้าไม่ให้ SM-2 จะหยาบลงจริง แต่ถ้าให้ ก็เพิ่มการกดอีก 1 ครั้งต่อการ์ด
6. **`answerMode` ตั้งที่การ์ดหรือที่ deck** — แผนนี้ตั้งที่การ์ด (ผสมในชุดเดียวได้ ยืดหยุ่นกว่า)
   ถ้าอยากให้ทั้ง deck เป็นโหมดเดียวกันหมด ย้ายไปไว้ที่ `FlashcardDeck` แล้วฟอร์มการ์ดจะง่ายลงเยอะ
