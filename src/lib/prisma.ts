import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Forçamos o caminho do banco diretamente para evitar que o Turbopack perca o .env
const dbUrl = "file:./dev.db";

const adapter = new PrismaLibSql({ url: dbUrl } as any);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: ["error"] 
} as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;