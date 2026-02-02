import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type GlobalPrisma = {
  prisma?: PrismaClient;
  pool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

// Use different connection strategies for serverless vs local
const connectionString =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
    : process.env.DATABASE_URL;

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 2 : 10,
    idleTimeoutMillis: process.env.NODE_ENV === 'production' ? 10000 : 20000,
    connectionTimeoutMillis: 8000,
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
