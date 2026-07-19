import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// GET: /api/admin/enrollments?userId=... - list a user's current enrollments
export async function GET(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "ต้องระบุ userId" }, { status: 400 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
            accessDuration: true,
            accessHours: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // A course counts as "purchased normally" if there's a completed order
    // for that user+course — enrollments created via the admin grant flow
    // have no such order, so this is how we tell the two apart.
    const courseIds = enrollments.map((e) => e.courseId);
    const completedOrders = courseIds.length
      ? await prisma.order.findMany({
          where: { userId, courseId: { in: courseIds }, status: "COMPLETED" },
          select: { courseId: true },
        })
      : [];
    const purchasedCourseIds = new Set(completedOrders.map((o) => o.courseId));

    const withSource = enrollments.map((e) => ({
      ...e,
      isPurchased: purchasedCourseIds.has(e.courseId),
    }));

    return NextResponse.json({ enrollments: withSource });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}

// POST: /api/admin/enrollments - admin grants a user access to one or more
// courses at once, bypassing the normal order/payment flow.
export async function POST(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, courseIds, accessDuration, accessHours } = await req.json();
  if (!userId || !Array.isArray(courseIds) || courseIds.length === 0) {
    return NextResponse.json({ error: "ต้องระบุ userId และ courseIds" }, { status: 400 });
  }

  try {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true },
    });
    const foundIds = new Set(courses.map((c) => c.id));
    const missingIds = courseIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `ไม่พบคอร์สบางรายการ: ${missingIds.join(", ")}` },
        { status: 404 }
      );
    }

    const granted = [];
    const alreadyEnrolled = [];

    for (const course of courses) {
      try {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId: course.id,
            progress: 0,
            status: "ACTIVE",
            accessDuration: accessDuration ?? null,
            accessHours: accessHours ?? null,
          },
        });
        granted.push(course.title);
      } catch (error) {
        if (error.code === "P2002") {
          alreadyEnrolled.push(course.title);
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({ granted, alreadyEnrolled });
  } catch (error) {
    console.error("Error granting course access:", error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}

const VALID_STATUSES = ["ACTIVE", "COMPLETED", "CANCELED"];

// PATCH: /api/admin/enrollments - update an existing enrollment: per-student
// access duration/hours override (pass null to clear back to the course's
// default), and/or status (e.g. cancel access). Only fields actually present
// in the request body are updated — omitting a field leaves it unchanged.
export async function PATCH(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { enrollmentId } = body;
  if (!enrollmentId) {
    return NextResponse.json({ error: "ต้องระบุ enrollmentId" }, { status: 400 });
  }

  if ("status" in body && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "status ไม่ถูกต้อง" }, { status: 400 });
  }

  const data = {};
  if ("accessDuration" in body) data.accessDuration = body.accessDuration ?? null;
  if ("accessHours" in body) data.accessHours = body.accessHours ?? null;
  if ("status" in body) data.status = body.status;

  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
            accessDuration: true,
            accessHours: true,
          },
        },
      },
    });
    return NextResponse.json({ enrollment });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบรายการลงทะเบียนที่ระบุ" }, { status: 404 });
    }
    console.error("Error updating enrollment access:", error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}

// DELETE: /api/admin/enrollments?enrollmentId=... - remove a course from a
// user entirely (used by the "ยกเลิกคอร์ส" action — a hard delete, not a
// status change, so the course disappears from their list completely).
export async function DELETE(req) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const enrollmentId = searchParams.get("enrollmentId");
  if (!enrollmentId) {
    return NextResponse.json({ error: "ต้องระบุ enrollmentId" }, { status: 400 });
  }

  try {
    await prisma.enrollment.delete({ where: { id: enrollmentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "ไม่พบรายการลงทะเบียนที่ระบุ" }, { status: 404 });
    }
    console.error("Error deleting enrollment:", error);
    return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
  }
}
