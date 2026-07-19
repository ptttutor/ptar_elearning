// src/app/api/external/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { refreshExternalToken, verifyExternalToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    const newToken = refreshExternalToken(token);
    
    if (!newToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

    const decoded = verifyExternalToken(newToken);

    const response = NextResponse.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: '7d',
        user: {
          id: decoded.data.userId,
          email: decoded.data.email,
          name: decoded.data.name,
          role: decoded.data.role,
        }
      }
    });
    response.cookies.set('jwt', newToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}