import { validateEnvOrExit } from './env-validation';

/**
 * Validates environment variables at application startup
 * This should be called as early as possible in your application lifecycle
 */
export function validateApplicationStartup(): void {
  console.log('🔍 Validating application startup requirements...');

  try {
    // Validate environment variables
    const envConfig = validateEnvOrExit();

    // Log successful validation
    console.log('✅ Application startup validation completed successfully');
    console.log(
      `📊 Database: ${envConfig.POSTGRES_HOST}:${envConfig.POSTGRES_PORT}/${envConfig.POSTGRES_DB}`,
    );
    console.log(`📧 AWS SES: ${envConfig.AWS_REGION}`);
  } catch (error) {
    console.error('❌ Application startup validation failed');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Validates environment variables for Next.js API routes
 * Use this in API routes that require specific environment variables
 */
export function validateApiEnvironment(): void {
  try {
    validateEnvOrExit();
  } catch (error) {
    throw new Error(
      'API environment validation failed: ' + (error as Error).message,
    );
  }
}
