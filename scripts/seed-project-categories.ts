// Seed project categories
// Run with: npx tsx scripts/seed-project-categories.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  console.log('Seeding project categories...');

  const projectCategories = [
    { id: 'proj_cat_web', slug: 'web', name: 'Web' },
    { id: 'proj_cat_mobile', slug: 'mobile', name: 'Mobile' },
    { id: 'proj_cat_3d', slug: '3d', name: '3D' },
    { id: 'proj_cat_ai', slug: 'ia', name: 'IA' },
    { id: 'proj_cat_other', slug: 'autre', name: 'Autre' },
  ];

  for (const cat of projectCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: { ...cat, type: 'PROJECT' },
      update: {},
    });
    console.log(`✓ ${cat.name}`);
  }

  // Also seed default blog categories
  const blogCategories = [
    { id: 'blog_cat_dev', slug: 'developpement', name: 'Développement' },
    { id: 'blog_cat_design', slug: 'design', name: 'Design' },
    { id: 'blog_cat_tutos', slug: 'tutoriels', name: 'Tutoriels' },
    { id: 'blog_cat_projets', slug: 'projets', name: 'Projets' },
    { id: 'blog_cat_apropos', slug: 'a-propos', name: 'À propos' },
  ];

  for (const cat of blogCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: { ...cat, type: 'BLOG' },
      update: {},
    });
    console.log(`✓ ${cat.name}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
