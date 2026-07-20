import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(request) {
  const session = requireUser(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, school: true, role: true, lineId: true, image: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(request) {
  const session = requireUser(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const school = typeof body.school === "string" ? body.school.trim().slice(0, 200) : undefined;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { ...(school !== undefined && { school: school || null }) },
    select: { id: true, email: true, name: true, school: true, role: true, lineId: true, image: true },
  });

  return NextResponse.json({ success: true, data: user });
}
