import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { UserProfile } from '@/database/entities/user-profile.entity';
import { ResponseStyle } from '@/database/entities/response-style.entity';
import { Project } from '@/database/entities/project.entity';
import { Conversation } from '@/database/entities/conversation.entity';
import { Message } from '@/database/entities/message.entity';
import { Prompt } from '@/database/entities/prompt.entity';

/**
 * TypeORM DataSource configuration for PostgreSQL
 *
 * Note: In Next.js serverless environments, connections are ephemeral.
 * This DataSource uses connection pooling and lazy initialization.
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'admin123',
  database: process.env.POSTGRES_DB || 'omnia_platform',

  // SSL configuration
  ssl:
    process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Entities
  entities: [
    User,
    UserProfile,
    ResponseStyle,
    Project,
    Conversation,
    Message,
    Prompt,
  ],

  // Auto-sync schema in development only (DANGER: never use in production)
  synchronize: isDevelopment && process.env.TYPEORM_SYNCHRONIZE === 'true',

  // Logging
  logging:
    process.env.TYPEORM_LOGGING === 'true'
      ? ['query', 'error', 'warn']
      : ['error'],

  // Connection pool settings for serverless
  extra: {
    // Maximum number of connections
    max: isProduction ? 10 : 5,
    // Minimum number of connections
    min: 1,
    // Connection timeout (ms)
    connectionTimeoutMillis: 5000,
    // Idle timeout (ms) - close connections idle for this long
    idleTimeoutMillis: 30000,
  },

  // Migrations (for future use)
  migrations: [],
  subscribers: [],
});

/**
 * Global variable to cache the DataSource instance
 * This prevents creating multiple connections in serverless environments
 */
let dataSourceInstance: DataSource | null = null;

/**
 * Get or initialize the DataSource singleton
 *
 * In Next.js serverless functions, each invocation might create a new instance.
 * This function ensures we reuse existing connections when possible.
 *
 * @returns Promise<DataSource> - Initialized DataSource instance
 */
export async function getDataSource(): Promise<DataSource> {
  // If already initialized and connected, return existing instance
  if (dataSourceInstance && dataSourceInstance.isInitialized) {
    return dataSourceInstance;
  }

  // If instance exists but not initialized, initialize it
  if (dataSourceInstance && !dataSourceInstance.isInitialized) {
    try {
      await dataSourceInstance.initialize();
      console.log('✅ TypeORM DataSource initialized');
      return dataSourceInstance;
    } catch (error) {
      console.error('❌ Error initializing TypeORM DataSource:', error);
      throw error;
    }
  }

  // Create new instance and initialize
  dataSourceInstance = AppDataSource;

  try {
    await dataSourceInstance.initialize();
    console.log('✅ TypeORM DataSource initialized');
    return dataSourceInstance;
  } catch (error) {
    console.error('❌ Error initializing TypeORM DataSource:', error);
    dataSourceInstance = null; // Reset on error
    throw error;
  }
}

/**
 * Close the DataSource connection
 * Useful for cleanup in tests or graceful shutdown
 */
export async function closeDataSource(): Promise<void> {
  if (dataSourceInstance && dataSourceInstance.isInitialized) {
    await dataSourceInstance.destroy();
    dataSourceInstance = null;
    console.log('✅ TypeORM DataSource closed');
  }
}

/**
 * Health check for database connection
 * Returns true if connection is healthy, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const dataSource = await getDataSource();
    await dataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
