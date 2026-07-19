import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createExternalToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' },
          { status: 401 }
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
    }

    const { password: _pw, ...userWithoutPassword } = user;
    const token = createExternalToken(userWithoutPassword);

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: { ...userWithoutPassword, token },
      token
    });
    response.cookies.set('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
