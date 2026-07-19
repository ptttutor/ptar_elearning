import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton Pattern for Serverless
 * 
 * ใช้ global variable เพื่อป้องกันการสร้าง PrismaClient หลายตัว
 * ซึ่งจะทำให้ connection pool เต็มใน Vercel Serverless Functions
 * 
 * Problems this solves:
 * 1. Connection pool exhaustion in serverless
 * 2. Multiple Prisma Client instances
 * 3. Too many database connections
 */

const globalForPrisma = globalThis;

// Prisma Client configuration optimized for Serverless
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

// Use cached Prisma Client or create new one
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Cache Prisma Client in development to prevent hot-reload issues
// In production, Vercel will handle the function lifecycle
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
