#!/usr/bin/env tsx
/**
 * Database Seeding Script
 *
 * Usage:
 *   pnpm seed              - Seed reference data only (safe for production)
 *   pnpm seed:dev          - Seed reference + development data
 *
 * Environment variables (from .env):
 *   POSTGRES_HOST
 *   POSTGRES_PORT
 *   POSTGRES_USER
 *   POSTGRES_PASSWORD
 *   POSTGRES_DB
 */

import 'reflect-metadata';
import { getDataSource, closeDataSource } from '../data-source';
import { seedReferenceData } from '../seeds/reference-data';
import { seedDevelopmentData } from '../seeds/development';

async function main() {
  const args = process.argv.slice(2);
  const seedDev = args.includes('--dev');

  console.log('🌱 Starting database seeding...');
  console.log(`Mode: ${seedDev ? 'DEVELOPMENT' : 'REFERENCE DATA ONLY'}`);
  console.log('');

  try {
    // Initialize database connection
    const dataSource = await getDataSource();
    console.log('✅ Database connection established');
    console.log('');

    // Always seed reference data
    await seedReferenceData(dataSource);
    console.log('');

    // Optionally seed development data
    if (seedDev) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Cannot seed development data in production environment');
        process.exit(1);
      }
      await seedDevelopmentData(dataSource);
      console.log('');
    }

    // Close connection
    await closeDataSource();
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Seeding failed:', error);
    await closeDataSource();
    process.exit(1);
  }
}

main();
