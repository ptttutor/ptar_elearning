import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// POST - นำเข้าการ์ดเป็นชุดจากข้อความคั่นด้วย tab (front\tback ต่อบรรทัด)
// รองรับเฉพาะโหมด SELF_GRADE เท่านั้น — โหมดเลือกตอบ/พิมพ์ตอบต้องกรอกทีละใบ
// เพราะต้องระบุตัวเลือก/เฉลยที่ยอมรับได้ ซึ่งใส่ในบรรทัดเดียวไม่ได้อย่างปลอดภัย
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { deckId, text } = await request.json();

    if (!deckId || !text || !text.trim()) {
      return NextResponse.json({
        success: false,
        error: "กรุณาระบุชุดการ์ดและข้อความที่จะนำเข้า",
      }, { status: 400 });
    }

    const deckExists = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!deckExists) {
      return NextResponse.json({ success: false, error: "ไม่พบชุดแฟลชการ์ดที่ระบุ" }, { status: 404 });
    }

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const rows = [];
    const skipped = [];

    for (const [i, line] of lines.entries()) {
      const [front, ...rest] = line.split("\t");
      const back = rest.join("\t").trim();
      if (!front?.trim() || !back) {
        skipped.push(i + 1);
        continue;
      }
      rows.push({ front: front.trim(), back });
    }

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: "ไม่พบข้อมูลที่นำเข้าได้ — แต่ละบรรทัดต้องเป็น รูปแบบ: คำถาม<Tab>คำตอบ",
      }, { status: 400 });
    }

    const currentMax = await prisma.flashcard.aggregate({
      where: { deckId },
      _max: { order: true },
    });
    const startOrder = (currentMax._max.order ?? 0) + 1;

    await prisma.flashcard.createMany({
      data: rows.map((r, i) => ({
        deckId,
        front: r.front,
        back: r.back,
        answerMode: "SELF_GRADE",
        order: startOrder + i,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `นำเข้าสำเร็จ ${rows.length} ใบ${skipped.length ? ` (ข้าม ${skipped.length} บรรทัดที่รูปแบบไม่ถูกต้อง)` : ""}`,
      data: { imported: rows.length, skippedLines: skipped },
    });
  } catch (error) {
    console.error("Error bulk importing flashcards:", error);
    return NextResponse.json({
      success: false,
      error: "เกิดข้อผิดพลาดในการนำเข้าการ์ด",
    }, { status: 500 });
  }
}
