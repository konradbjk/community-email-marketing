import { z } from 'zod';

// Define the schema for all required environment variables
const envSchema = z.object({
  // Database Configuration (Required)
  POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
  POSTGRES_PORT: z
    .string()
    .regex(/^\d+$/, 'POSTGRES_PORT must be a number')
    .transform(Number),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  POSTGRES_SSL: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // AWS SES Configuration (Required)
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_SESSION_TOKEN: z.string().optional(), // For temporary credentials

  // Application Configuration
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // TypeORM Configuration
  TYPEORM_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  TYPEORM_SYNCHRONIZE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),

  // AI Integration (Optional - for future spam testing)
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Backend AI Integration
  BACKEND_API_URL: z.url().optional().default('http://localhost:8000'),
  BACKEND_API_TIMEOUT: z.coerce
    .number()
    .min(0, 'BACKEND_API_TIMEOUT must be zero or a positive integer')
    .optional()
    .default(60000),
  BACKEND_API_MODEL: z.string().optional().default('gpt-4'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentValidationError extends Error {
  constructor(message: string, public readonly issues: z.ZodIssue[]) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates all required environment variables at application startup
 * @throws {EnvironmentValidationError} When validation fails
 * @returns {EnvConfig} Validated and typed environment configuration
 */
export function validateEnvironmentVariables(): EnvConfig {
  try {
    const result = envSchema.parse(process.env);
    console.log('✅ Environment variables validation passed');
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = formatValidationErrors(error.issues);
      console.error('❌ Environment variables validation failed:');
      console.error(errorMessage);

      throw new EnvironmentValidationError(
        'Environment variables validation failed',
        error.issues,
      );
    }
    throw error;
  }
}

/**
 * Formats validation errors into a readable format
 */
function formatValidationErrors(issues: z.ZodIssue[]): string {
  const errors = issues.map((issue) => {
    const path = issue.path.join('.');
    return `  • ${path}: ${issue.message}`;
  });

  return [
    'Missing or invalid environment variables:',
    ...errors,
    '',
    'Please check your .env file and ensure all required variables are set.',
    'Refer to .env.example for the expected format.',
  ].join('\n');
}

/**
 * Safe environment variable getter with validation
 * Use this instead of direct process.env access for better type safety
 */
export function getEnvConfig(): EnvConfig {
  return validateEnvironmentVariables();
}

/**
 * Validates environment variables and exits process if validation fails
 * Use this in your application startup (e.g., in next.config.js or server startup)
 */
export function validateEnvOrExit(): EnvConfig {
  try {
    return validateEnvironmentVariables();
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error(
        '\n🚨 Application cannot start due to environment configuration errors.\n',
      );
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validates critical environment variables only (for minimal checks)
 */
export function validateCriticalEnv(): void {
  const criticalVars = [
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];

  const missing = criticalVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      '❌ Critical environment variables missing:',
      missing.join(', '),
    );
    throw new Error(
      `Missing critical environment variables: ${missing.join(', ')}`,
    );
  }

  console.log('✅ Critical environment variables present');
}
