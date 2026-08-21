// ===== Chemistry Flashcards seed script =====
// Seeds one real deck ("เคมี: โครงสร้างอะตอมและตารางธาตุ", ม.ปลาย) with 20
// flashcards covering atomic structure + periodic table, mixing all three
// answer modes (SELF_GRADE / MULTIPLE_CHOICE / TYPED). Two cards get a real
// reference image, downloaded from Wikimedia Commons (public-domain /
// CC-BY-SA, see comments below) and re-uploaded to this project's own
// Vercel Blob store — not hotlinked.
//
// Run standalone: node prisma/seed-flashcards-chemistry.js
// Idempotent: safe to run repeatedly — looks up the deck/cards by
// (deckId, front) before creating, so re-running won't duplicate rows.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');

const prisma = new PrismaClient();

// ---------------------------------------------------------------------
// Reference images — both verified reachable + license-checked before
// use (see plan.md discussion). Downloaded here and re-uploaded to our
// own Blob store rather than hotlinked, so the flashcard doesn't depend
// on Wikimedia staying up.
// ---------------------------------------------------------------------
const IMAGES = {
  periodicTable: {
    // Simple Periodic Table Chart — Offnfopt, released CC0 (public domain).
    // https://commons.wikimedia.org/wiki/File:Simple_Periodic_Table_Chart-en.svg
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Simple_Periodic_Table_Chart-en.svg",
    filename: "periodic-table-chart.svg",
  },
  bohrModel: {
    // Bohr atom model (multilingual) — Brighterorange, CC-BY-SA 3.0 / GFDL.
    // https://commons.wikimedia.org/wiki/File:Bohr_atom_model_English.svg (mul variant)
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/Bohr_atom_model_%28mul%29.svg",
    filename: "bohr-atom-model.svg",
  },
};

async function downloadAndUploadImage({ sourceUrl, filename }) {
  console.log(`  Downloading ${filename} from Wikimedia Commons...`);
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to download ${sourceUrl}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  console.log(`  Uploading ${filename} to Vercel Blob (${(buffer.length / 1024).toFixed(1)} KB)...`);
  const blob = await put(`flashcard-images/${filename}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/svg+xml",
  });
  console.log(`  -> ${blob.url}`);
  return blob.url;
}

// ---------------------------------------------------------------------
// Card content — real high-school (ม.ปลาย) chemistry, atomic structure
// and periodic table unit. `imageKey` refers to IMAGES above and is
// resolved to a real blob URL at seed time.
// ---------------------------------------------------------------------
const CARDS = [
  {
    answerMode: "SELF_GRADE",
    imageKey: "bohrModel",
    front: "แบบจำลองอะตอมของโบร์ (Bohr) อธิบายโครงสร้างอะตอมอย่างไร",
    back: "อิเล็กตรอนเคลื่อนที่รอบนิวเคลียสเป็นวงโคจรเฉพาะ (orbit) ที่มีระดับพลังงานคงที่แน่นอน โดยจะไม่แผ่รังสีพลังงานออกมาขณะอยู่ในวงโคจรนั้น และจะดูดกลืน/คายพลังงานก็ต่อเมื่อย้ายระดับพลังงานเท่านั้น",
    hint: "นึกถึงวงโคจรของดาวเคราะห์รอบดวงอาทิตย์",
  },
  {
    answerMode: "SELF_GRADE",
    front: "อนุภาคมูลฐานของอะตอมมีอะไรบ้าง พร้อมประจุไฟฟ้า",
    back: "โปรตอน (ประจุ +1, อยู่ในนิวเคลียส), นิวตรอน (ไม่มีประจุ, อยู่ในนิวเคลียส), อิเล็กตรอน (ประจุ -1, เคลื่อนที่รอบนิวเคลียส)",
  },
  {
    answerMode: "TYPED",
    front: "เลขอะตอม (Atomic Number, Z) หมายถึงอะไร",
    back: "จำนวนโปรตอนในนิวเคลียสของอะตอมนั้น",
    acceptedAnswers: ["จำนวนโปรตอน", "จำนวนโปรตอนในนิวเคลียส", "จำนวนโปรตอนในอะตอม"],
  },
  {
    answerMode: "TYPED",
    front: "เลขมวล (Mass Number, A) คำนวณจากอะไร",
    back: "เลขมวล = จำนวนโปรตอน + จำนวนนิวตรอน",
    acceptedAnswers: ["โปรตอน+นิวตรอน", "จำนวนโปรตอนบวกจำนวนนิวตรอน", "p+n", "โปรตอนบวกนิวตรอน"],
  },
  {
    answerMode: "SELF_GRADE",
    front: "ไอโซโทป (Isotope) คืออะไร",
    back: "อะตอมของธาตุชนิดเดียวกัน (มีเลขอะตอมเท่ากัน) แต่มีจำนวนนิวตรอนต่างกัน จึงมีเลขมวลต่างกันด้วย",
  },
  {
    answerMode: "MULTIPLE_CHOICE",
    front: "ธาตุคาร์บอน-14 (6C-14) มีจำนวนนิวตรอนเท่าใด",
    back: "8 ตัว (เลขมวล 14 − เลขอะตอม 6 = นิวตรอน 8)",
    options: [
      { text: "6", correct: false },
      { text: "8", correct: true },
      { text: "14", correct: false },
      { text: "20", correct: false },
    ],
  },
  {
    answerMode: "SELF_GRADE",
    front: "การจัดเรียงอิเล็กตรอนตามระดับพลังงานหลัก (K L M N ...) จุอิเล็กตรอนได้สูงสุดตามสูตรใด",
    back: "ระดับพลังงานที่ n จุอิเล็กตรอนได้สูงสุด 2n² ตัว (K=2, L=8, M=18, N=32)",
    hint: "n คือลำดับของระดับพลังงาน (K=1, L=2, M=3, ...)",
  },
  {
    answerMode: "TYPED",
    front: "เวเลนซ์อิเล็กตรอนของธาตุหมู่ 17 (ฮาโลเจน) มีกี่ตัว",
    back: "7 ตัว",
    acceptedAnswers: ["7", "7 ตัว"],
  },
  {
    answerMode: "SELF_GRADE",
    imageKey: "periodicTable",
    front: "ตารางธาตุจัดเรียงธาตุตามหลักเกณฑ์ใดเป็นหลัก",
    back: "จัดเรียงตามเลขอะตอมที่เพิ่มขึ้นจากซ้ายไปขวา และจัดกลุ่มธาตุที่มีสมบัติทางเคมีคล้ายกันไว้ในหมู่ (คอลัมน์) เดียวกัน",
  },
  {
    answerMode: "SELF_GRADE",
    front: "คาบ (Period) ในตารางธาตุ บอกอะไรเกี่ยวกับอะตอม",
    back: "บอกจำนวนระดับพลังงาน (shell) ของอิเล็กตรอนในอะตอม — ธาตุในคาบเดียวกันมีจำนวนระดับพลังงานเท่ากัน",
  },
  {
    answerMode: "SELF_GRADE",
    front: "หมู่ (Group) ในตารางธาตุ บอกอะไรเกี่ยวกับอะตอม",
    back: "สำหรับธาตุหมู่ A จะบอกจำนวนเวเลนซ์อิเล็กตรอน — ธาตุในหมู่เดียวกันมีสมบัติทางเคมีคล้ายกันเพราะมีเวเลนซ์อิเล็กตรอนเท่ากัน",
  },
  {
    answerMode: "MULTIPLE_CHOICE",
    front: "ธาตุหมู่ 1 (IA) ไม่รวมไฮโดรเจน จัดอยู่ในกลุ่มใด",
    back: "โลหะแอลคาไล (Alkali metals) เช่น Li, Na, K — มีเวเลนซ์อิเล็กตรอน 1 ตัว ทำปฏิกิริยาไวมาก",
    options: [
      { text: "แฮโลเจน (Halogens)", correct: false },
      { text: "โลหะแอลคาไล (Alkali metals)", correct: true },
      { text: "แก๊สมีสกุล (Noble gases)", correct: false },
      { text: "โลหะแอลคาไลน์เอิร์ท (Alkaline earth metals)", correct: false },
    ],
  },
  {
    answerMode: "SELF_GRADE",
    front: "ขนาดอะตอม (Atomic radius) มีแนวโน้มเปลี่ยนแปลงอย่างไรเมื่อเลื่อนจากซ้ายไปขวาในคาบเดียวกัน",
    back: "มีแนวโน้ม 'เล็กลง' เพราะจำนวนโปรตอนเพิ่มขึ้น ทำให้แรงดึงดูดของนิวเคลียสต่ออิเล็กตรอนวงนอกมากขึ้น (ขณะที่ระดับพลังงานยังเท่าเดิม)",
  },
  {
    answerMode: "SELF_GRADE",
    front: "พลังงานไอออไนเซชัน (Ionization Energy) คืออะไร",
    back: "พลังงานขั้นต่ำที่ใช้ดึงอิเล็กตรอนวงนอกสุดออกจากอะตอมในสถานะแก๊ส — ยิ่งอะตอมมีขนาดเล็กและแรงดึงดูดนิวเคลียสมาก พลังงานไอออไนเซชันยิ่งสูง",
  },
  {
    answerMode: "SELF_GRADE",
    front: "สัมพรรคภาพอิเล็กตรอน (Electron Affinity) หมายถึงอะไร",
    back: "พลังงานที่คายออกมาเมื่ออะตอมในสถานะแก๊สรับอิเล็กตรอนเพิ่มเข้าไป 1 ตัว จนกลายเป็นไอออนลบ",
  },
  {
    answerMode: "SELF_GRADE",
    front: "อิเล็กโทรเนกาติวิตี (Electronegativity) คืออะไร",
    back: "ความสามารถของอะตอมในการดึงดูดคู่อิเล็กตรอนที่ใช้ร่วมกันในพันธะเคมีมาไว้ที่ตัวเอง — ธาตุฟลูออรีน (F) มีค่าสูงที่สุดในตารางธาตุ",
  },
  {
    answerMode: "MULTIPLE_CHOICE",
    front: "เพราะเหตุใดธาตุหมู่ 18 (แก๊สมีสกุล) จึงเสถียรมากและไม่ค่อยทำปฏิกิริยา",
    back: "เพราะมีเวเลนซ์อิเล็กตรอนครบ 8 ตัว (octet) ยกเว้นฮีเลียมที่มีครบ 2 ตัว ทำให้อะตอมเสถียรมากโดยไม่ต้องรับ เสีย หรือใช้อิเล็กตรอนร่วมกับอะตอมอื่น",
    options: [
      { text: "มีเวเลนซ์อิเล็กตรอนครบ 8 ตัว (octet)", correct: true },
      { text: "มีนิวตรอนมากที่สุดในตาราง", correct: false },
      { text: "ไม่มีอิเล็กตรอนเลย", correct: false },
      { text: "มีขนาดอะตอมใหญ่ที่สุด", correct: false },
    ],
  },
  {
    answerMode: "SELF_GRADE",
    front: "โลหะทรานซิชัน (Transition metals) อยู่ตรงส่วนใดของตารางธาตุ",
    back: "อยู่ในหมู่ B (บล็อก d) ระหว่างหมู่ 2 กับหมู่ 13 เช่น Fe, Cu, Zn, Ag, Au",
  },
  {
    answerMode: "TYPED",
    front: "เลขออกซิเดชันของออกซิเจน (O) ในสารประกอบทั่วไป (ยกเว้นเปอร์ออกไซด์) มีค่าเท่าใด",
    back: "−2",
    acceptedAnswers: ["-2", "−2", "ลบ2", "ลบ 2"],
  },
  {
    answerMode: "SELF_GRADE",
    front: "เวเลนซ์อิเล็กตรอนของธาตุหมู่ A มีความสัมพันธ์กับเลขหมู่อย่างไร",
    back: "เท่ากับเลขหมู่ A นั้นโดยตรง เช่น หมู่ IA มีเวเลนซ์อิเล็กตรอน 1 ตัว หมู่ VIIA มีเวเลนซ์อิเล็กตรอน 7 ตัว",
  },
];

async function main() {
  console.log("=== Seeding Chemistry flashcards ===\n");

  // 1) Loose tie-in to a MockTopic, same as an admin would set up via the
  //    deck form (see plan.md §1 for why the tie-in is topicId, not a hard FK).
  const topic = await prisma.mockTopic.upsert({
    where: { subject_name: { subject: "Chemistry", name: "โครงสร้างอะตอมและตารางธาตุ" } },
    update: {},
    create: { subject: "Chemistry", name: "โครงสร้างอะตอมและตารางธาตุ" },
  });
  console.log(`Topic ready: ${topic.name} (${topic.id})`);

  // 2) Download + re-upload reference images to our own Blob store.
  const imageUrls = {};
  for (const [key, def] of Object.entries(IMAGES)) {
    imageUrls[key] = await downloadAndUploadImage(def);
  }

  // 3) Deck (find-or-create by title, idempotent).
  const deckTitle = "เคมี: โครงสร้างอะตอมและตารางธาตุ";
  let deck = await prisma.flashcardDeck.findFirst({ where: { title: deckTitle } });
  if (!deck) {
    deck = await prisma.flashcardDeck.create({
      data: {
        title: deckTitle,
        description: "ทบทวนโครงสร้างอะตอม อนุภาคมูลฐาน การจัดเรียงอิเล็กตรอน และแนวโน้มสมบัติของธาตุในตารางธาตุ",
        subject: "Chemistry",
        gradeLevel: "SENIOR_HIGH",
        topicId: topic.id,
        coverImageUrl: imageUrls.periodicTable,
        isActive: true,
      },
    });
    console.log(`\nCreated deck: ${deck.title} (${deck.id})`);
  } else {
    console.log(`\nDeck already exists, reusing: ${deck.title} (${deck.id})`);
  }

  // 4) Cards — idempotent per (deckId, front).
  let created = 0;
  let skipped = 0;
  for (let i = 0; i < CARDS.length; i++) {
    const def = CARDS[i];
    const existing = await prisma.flashcard.findFirst({ where: { deckId: deck.id, front: def.front } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.flashcard.create({
      data: {
        deckId: deck.id,
        front: def.front,
        frontImage: def.imageKey ? imageUrls[def.imageKey] : null,
        back: def.back,
        hint: def.hint || null,
        answerMode: def.answerMode,
        acceptedAnswers: def.answerMode === "TYPED" ? def.acceptedAnswers || [] : [],
        order: i + 1,
        ...(def.answerMode === "MULTIPLE_CHOICE" &&
          def.options && {
            options: {
              create: def.options.map((opt, idx) => ({
                optionText: opt.text,
                isCorrect: opt.correct,
                order: idx + 1,
              })),
            },
          }),
      },
    });
    created++;
  }

  console.log(`\nDone. Cards created: ${created}, skipped (already existed): ${skipped}, total in deck: ${CARDS.length}`);
  console.log(`Deck URL (admin): /admin/flashcard-decks/cards/${deck.id}`);
  console.log(`Deck URL (student): /flashcards/${deck.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
