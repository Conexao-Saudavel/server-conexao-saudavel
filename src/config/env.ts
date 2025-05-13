import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Validação do ambiente atual
const validEnvs = ['development', 'test', 'production'] as const;
type ValidEnv = typeof validEnvs[number];

if (!process.env.NODE_ENV || !validEnvs.includes(process.env.NODE_ENV as ValidEnv)) {
  throw new Error(
    `❌ Ambiente inválido: ${process.env.NODE_ENV}. Use um dos seguintes: ${validEnvs.join(', ')}`
  );
}

// Carrega o arquivo .env baseado no ambiente
const envFile = `.env.${process.env.NODE_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

try {
  config({ path: envPath });
  console.log(`✅ Carregando variáveis de ambiente de: ${envFile}`);
} catch (error) {
  throw new Error(`❌ Erro ao carregar arquivo de ambiente ${envFile}: ${error.message}`);
}

// Schema de validação das variáveis de ambiente
const envSchema = z.object({
  // Servidor
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_URL: z.string().url(),
  API_VERSION: z.string(),

  // Banco de Dados
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),

  // Autenticação
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string(),
  SYNC_SECRET_KEY: z.string().min(32),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),

  // Cache
  CACHE_TTL: z.string().transform(Number),
  CACHE_PREFIX: z.string(),

  // Rate Limiting
  API_RATE_LIMIT: z.string().transform(Number),
  API_RATE_WINDOW_MS: z.string().transform(Number),

  // Log
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']),
  LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']),

  // Monitoramento
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().transform(Number),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3']),
  STORAGE_PATH: z.string(),

  // Filas
  QUEUE_URL: z.string().url(),
  QUEUE_PREFIX: z.string(),

  // Relatórios
  REPORT_STORAGE_PATH: z.string(),
  PDF_STORAGE_PATH: z.string(),

  // Segurança
  CORS_ORIGIN: z.string(),
  CORS_METHODS: z.string(),
  CORS_CREDENTIALS: z.string().transform((val) => val === 'true'),
  HELMET_ENABLED: z.string().transform((val) => val === 'true'),
  XSS_PROTECTION: z.string().transform((val) => val === 'true'),
  RATE_LIMIT_ENABLED: z.string().transform((val) => val === 'true'),

  // Desenvolvimento
  DEBUG: z.string().optional(),
  NODE_OPTIONS: z.string().optional(),
  TSC_COMPILE_ON_ERROR: z.string().optional(),
});

// Função para validar e carregar as variáveis de ambiente
function validateEnv() {
  try {
    const validatedEnv = envSchema.parse(process.env);
    console.log(`✅ Variáveis de ambiente validadas com sucesso para o ambiente: ${validatedEnv.NODE_ENV}`);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        const message = err.message;
        return `\n  - ${path}: ${message}`;
      }).join('');
      throw new Error(`❌ Variáveis de ambiente inválidas ou faltando:${missingVars}`);
    }
    throw error;
  }
}

// Exporta as variáveis de ambiente validadas
export const env = validateEnv();

// Tipagem das variáveis de ambiente
export type Env = z.infer<typeof envSchema>;

// Função auxiliar para verificar o ambiente atual
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
export const isProduction = env.NODE_ENV === 'production';

// Função auxiliar para obter configurações específicas por ambiente
export const getEnvConfig = () => {
  const baseConfig = {
    cors: {
      origin: env.CORS_ORIGIN.split(','),
      methods: env.CORS_METHODS.split(','),
      credentials: env.CORS_CREDENTIALS,
    },
    security: {
      helmet: env.HELMET_ENABLED,
      xssProtection: env.XSS_PROTECTION,
      rateLimit: {
        enabled: env.RATE_LIMIT_ENABLED,
        windowMs: env.API_RATE_WINDOW_MS,
        max: env.API_RATE_LIMIT,
      },
    },
    logging: {
      level: env.LOG_LEVEL,
      format: env.LOG_FORMAT,
    },
    sentry: {
      dsn: env.SENTRY_DSN,
      environment: env.SENTRY_ENVIRONMENT,
      tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    },
    database: {
      url: env.DATABASE_URL,
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
    },
    redis: {
      url: env.REDIS_URL,
      password: env.REDIS_PASSWORD,
    },
    storage: {
      provider: env.STORAGE_PROVIDER,
      path: env.STORAGE_PATH,
    },
    email: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.EMAIL_FROM,
    },
  };

  // Configurações específicas por ambiente
  const envSpecificConfig = {
    development: {
      ...baseConfig,
      logging: {
        ...baseConfig.logging,
        level: 'debug',
      },
      security: {
        ...baseConfig.security,
        helmet: false,
        xssProtection: false,
        rateLimit: {
          ...baseConfig.security.rateLimit,
          enabled: false,
        },
      },
    },
    test: {
      ...baseConfig,
      logging: {
        ...baseConfig.logging,
        level: 'error',
      },
      security: {
        ...baseConfig.security,
        helmet: false,
        xssProtection: false,
        rateLimit: {
          ...baseConfig.security.rateLimit,
          enabled: false,
        },
      },
    },
    production: {
      ...baseConfig,
      logging: {
        ...baseConfig.logging,
        level: 'info',
      },
      security: {
        ...baseConfig.security,
        helmet: true,
        xssProtection: true,
        rateLimit: {
          ...baseConfig.security.rateLimit,
          enabled: true,
        },
      },
    },
  };

  return envSpecificConfig[env.NODE_ENV];
};

// Funções auxiliares adicionais
export const getCurrentEnvConfig = () => getEnvConfig();

// Função para verificar se uma feature está habilitada no ambiente atual
export const isFeatureEnabled = (feature: keyof typeof env) => {
  const value = env[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
};

// Função para obter URLs baseadas no ambiente
export const getBaseUrls = () => ({
  api: env.API_URL,
  frontend: isProduction 
    ? 'https://conexaosaudavel.com.br'
    : isTest 
      ? 'http://localhost:3001'
      : 'http://localhost:5173',
  docs: isProduction 
    ? 'https://docs.conexaosaudavel.com.br'
    : 'http://localhost:3000/docs',
}); 