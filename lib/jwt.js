// src/lib/jwt.js
import jwt from 'jsonwebtoken';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set — refusing to sign/verify JWTs with a fallback secret');
}
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
const JWT_EXPIRES_IN = '7d';

/**
 * Create JWT token for external frontend
 */
export const createExternalToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lineId: user.lineId,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'e-learning-system',
    audience: 'external-frontend'
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyExternalToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'e-learning-system',
      audience: 'external-frontend'
    });
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Refresh JWT token
 */
export const refreshExternalToken = (token) => {
  const verification = verifyExternalToken(token);
  if (!verification.valid) {
    return null;
  }

  // สร้าง token ใหม่ด้วยข้อมูลเดิม (ลบ claim ที่ jwt.sign จะใส่ให้เองออกก่อน
  // ไม่งั้น jsonwebtoken จะ throw เพราะ payload มี aud/iss ซ้ำกับ options)
  const { iat, exp, iss, aud, ...userData } = verification.data;
  return jwt.sign(userData, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'e-learning-system',
    audience: 'external-frontend'
  });
};