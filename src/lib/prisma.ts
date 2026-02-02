import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type GlobalPrisma = {
  prisma?: PrismaClient;
  pool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

// Supabase connection string
const connectionString =
  process.env.DATABASE_URL || // Fallback to standard name
  process.env.POSTGRES_URL || // Supabase pooler (recommended for serverless)
  process.env.POSTGRES_URL_NON_POOLING; // Direct connection (for migrations)

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });

const adapter = new PrismaPg(pool, {
  // Use read replica for reads if available
  // datasources: { db: { url: process.env.DATABASE_URL_RO } },
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export const disconnect = async () => {
  await prisma.$disconnect();
  await pool.end();
};
