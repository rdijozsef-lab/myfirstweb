import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

function ensureLocalSqliteDatabase() {
  if (process.env.NODE_ENV === 'production') return;
  if (process.env.DATABASE_URL !== 'file:./dev.db') return;

  const primaryDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const fallbackDbPath = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db');

  try {
    const primaryStats = fs.existsSync(primaryDbPath) ? fs.statSync(primaryDbPath) : null;
    const fallbackStats = fs.existsSync(fallbackDbPath) ? fs.statSync(fallbackDbPath) : null;

    if ((primaryStats?.size ?? 0) > 0 || !fallbackStats || fallbackStats.size === 0) return;

    fs.mkdirSync(path.dirname(primaryDbPath), { recursive: true });
    fs.copyFileSync(fallbackDbPath, primaryDbPath);
  } catch (error) {
    console.warn('Failed to restore local Prisma SQLite database.', error);
  }
}

ensureLocalSqliteDatabase();

export const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
