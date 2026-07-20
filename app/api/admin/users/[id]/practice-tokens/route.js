import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - ดูยอด practice token ของผู้ใช้ (สร้าง wallet ให้อัตโนมัติถ้ายังไม่มี — default 10)
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "ไม่พบผู้ใช้ที่ระบุ" }, { status: 404 });
    }

    const wallet = await prisma.mockPracticeWallet.upsert({
      where: { userId: id },
      update: {},
      create: { userId: id },
    });

    return NextResponse.json({ success: true, data: wallet });
  } catch (error) {
    console.error("Error fetching practice token wallet:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูล token" }, { status: 500 });
  }
}

// PUT - ตั้งยอด practice token ของผู้ใช้ (ตั้งค่าแบบ absolute ไม่ใช่บวกเพิ่ม)
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const tokens = Number(data.tokens);

    if (!Number.isInteger(tokens) || tokens < 0) {
      return NextResponse.json({
        success: false,
        error: "จำนวน token ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป",
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "ไม่พบผู้ใช้ที่ระบุ" }, { status: 404 });
    }

    const wallet = await prisma.mockPracticeWallet.upsert({
      where: { userId: id },
      update: { tokens },
      create: { userId: id, tokens },
    });

    return NextResponse.json({ success: true, data: wallet, message: "แก้ไขยอด token สำเร็จ" });
  } catch (error) {
    console.error("Error updating practice token wallet:", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการแก้ไขยอด token" }, { status: 500 });
  }
}
