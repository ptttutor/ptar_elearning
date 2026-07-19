import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/requireAdmin";

// GET - List users with filtering and pagination
export async function GET(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const parsedPage = parseInt(searchParams.get("page"), 10);
    const parsedLimit = parseInt(searchParams.get("limit"), 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const allowedSortFields = new Set(["createdAt", "name", "email", "role", "lineId", "updatedAt"]);
    const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    // Search filter — case-insensitive so "tawan" also matches "Tawan"/"TAWAN"
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { lineId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (role !== "all") {
      whereConditions.role = role;
    }

    // Status filter (you can customize this based on your User model)
    // For now, we'll assume all users are active unless you have a status field
    if (status !== "all") {
      // Add status filter logic here if you have a status field in your User model
      // whereConditions.status = status;
    }

    // Sorting
    const orderBy = {};
    orderBy[safeSortBy] = safeSortOrder;

    // Fetch users + global (unfiltered) role counts for the overview stat
    // cards — those must reflect the real counts across the whole table,
    // not just whatever page/filter the admin currently has selected.
    const [users, totalCount, roleCounts] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        orderBy,
        skip,
        take: limit,
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
              courses: true, // If user can have courses (instructor)
            },
          },
        },
      }),
      prisma.user.count({
        where: whereConditions,
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    const stats = { total: 0, students: 0, instructors: 0, admins: 0 };
    for (const row of roleCounts) {
      stats.total += row._count._all;
      if (row.role === "STUDENT") stats.students = row._count._all;
      else if (row.role === "INSTRUCTOR") stats.instructors = row._count._all;
      else if (row.role === "ADMIN") stats.admins = row._count._all;
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        total: totalCount,
        stats,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
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

// POST - Create new user
export async function POST(request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, password, lineId, image } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, อีเมล, รหัสผ่าน)",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "อีเมลนี้ได้ถูกใช้งานแล้ว",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "STUDENT",
        password: hashedPassword,
        lineId,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        lineId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: "สร้างผู้ใช้สำเร็จ",
    });
  } catch (error) {
    console.error("Create user error:", error);
    
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
        error: "เกิดข้อผิดพลาดในการสร้างผู้ใช้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
