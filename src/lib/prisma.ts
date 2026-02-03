import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

type GlobalPrisma = {
  prisma?: PrismaClient;
  pool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

// Direct connection URL - use non-pooling for Prisma to work correctly
// The pgbouncer connection pooling in Vercel serverless doesn't work well with Prisma's connection pool
const rawConnectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Strip SSL parameters from connection string to avoid conflicts with Pool SSL config
// The 'pg' library's SSL config will handle the TLS connection properly
const connectionString = rawConnectionString?.replace(/[?&]sslmode=[^&]*/g, '');

// Create connection pool with explicit SSL configuration for Supabase
// Supabase uses self-signed certificates that require rejectUnauthorized: false
const poolConfig: PoolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
};

// Add SSL configuration for Supabase/PostgreSQL connections
// This is required because Supabase's certificate chain may include self-signed certs
if (connectionString?.includes('supabase.com') || connectionString?.includes('postgres') || connectionString?.includes('postgresql')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = globalForPrisma.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool;
}

// Create adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const disconnect = async () => {
  await prisma.$disconnect();
  await pool.end();
};
