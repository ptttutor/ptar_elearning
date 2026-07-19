import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - Get single user
export async function GET(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            courses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, role, lineId, image, password } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: "อีเมลนี้ได้ถูกใช้งานแล้ว",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      role,
      lineId,
      image,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "อีเมลหรือข้อมูลที่ไม่ซ้ำกันได้ถูกใช้งานแล้ว",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            courses: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบผู้ใช้ที่ระบุ",
        },
        { status: 404 }
      );
    }

    // Prevent deleting admin users (optional protection)
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ดูแลระบบได้",
        },
        { status: 403 }
      );
    }

    const instructorCourses = await prisma.course.findMany({
      where: { instructorId: id },
      select: { id: true },
    });
    const instructorCourseIds = instructorCourses.map((course) => course.id);

    const orderWhere = {
      OR: [
        { userId: id },
        ...(instructorCourseIds.length > 0 ? [{ courseId: { in: instructorCourseIds } }] : []),
      ],
    };

    const relatedOrders = await prisma.order.findMany({
      where: orderWhere,
      select: { id: true },
    });
    const orderIds = relatedOrders.map((order) => order.id);

    await prisma.$transaction(async (tx) => {
      if (instructorCourseIds.length > 0) {
        await tx.studentAnswer.deleteMany({
          where: {
            OR: [
              { attempt: { exam: { courseId: { in: instructorCourseIds } } } },
              { question: { exam: { courseId: { in: instructorCourseIds } } } },
            ],
          },
        });

        await tx.examAttempt.deleteMany({
          where: { exam: { courseId: { in: instructorCourseIds } } },
        });

        await tx.questionOption.deleteMany({
          where: { question: { exam: { courseId: { in: instructorCourseIds } } } },
        });

        await tx.question.deleteMany({
          where: { exam: { courseId: { in: instructorCourseIds } } },
        });

        await tx.exam.deleteMany({
          where: { courseId: { in: instructorCourseIds } },
        });

        await tx.review.deleteMany({
          where: { courseId: { in: instructorCourseIds } },
        });

        await tx.enrollment.deleteMany({
          where: { courseId: { in: instructorCourseIds } },
        });

        await tx.content.deleteMany({
          where: { chapter: { courseId: { in: instructorCourseIds } } },
        });

        await tx.chapter.deleteMany({
          where: { courseId: { in: instructorCourseIds } },
        });
      }

      await tx.studentAnswer.deleteMany({
        where: { attempt: { userId: id } },
      });

      await tx.examAttempt.deleteMany({
        where: { userId: id },
      });

      await tx.review.deleteMany({
        where: { userId: id },
      });

      await tx.enrollment.deleteMany({
        where: { userId: id },
      });

      await tx.postContent.deleteMany({
        where: { authorId: id },
      });

      await tx.postContent.deleteMany({
        where: { post: { authorId: id } },
      });

      await tx.post.deleteMany({
        where: { authorId: id },
      });

      await tx.couponUsage.deleteMany({
        where: { userId: id },
      });

      await tx.ebookDownload.deleteMany({
        where: { userId: id },
      });

      if (orderIds.length > 0) {
        await tx.ebookDownload.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        await tx.couponUsage.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        await tx.shipping.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        await tx.payment.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        });
      }

      if (instructorCourseIds.length > 0) {
        await tx.course.deleteMany({
          where: { id: { in: instructorCourseIds } },
        });
      }

      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `ลบผู้ใช้สำเร็จ (โหมดอันตราย): ลบคอร์สผู้สอน ${instructorCourseIds.length} คอร์ส และคำสั่งซื้อที่เกี่ยวข้อง ${orderIds.length} รายการ ข้อมูลถูกลบถาวรและไม่สามารถกู้คืนได้`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    
    // Handle specific Prisma errors
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องในระบบ",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการลบผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
