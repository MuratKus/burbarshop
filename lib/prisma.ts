import { PrismaClient } from '@prisma/client'

// Set DATABASE_URL for Prisma if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_DATABASE_URL || 
                            process.env.DATABASE_POSTGRES_URL || 
                            process.env.DATABASE_POSTGRES_PRISMA_URL ||
                            process.env.POSTGRES_URL
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma