import { NextResponse } from 'next/server';
import { verifyExternalToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('jwt')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const verification = verifyExternalToken(token);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId, email, name, role, lineId } = verification.data;
    return NextResponse.json({
      success: true,
      data: { id: userId, email: email ?? null, name: name ?? null, role: role ?? 'STUDENT', lineId: lineId ?? null },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
