import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente apropriadas
const env = process.env.NODE_ENV || 'development';
const envPath = process.env.NODE_ENV === 'production' 
  ? '/app/.env.production' 
  : path.resolve(process.cwd(), '.env.development');

console.log('Inicializando configurações:', {
    envPath,
    nodeEnv: env
});

console.log('Carregando variáveis de ambiente de:', envPath);
console.log('NODE_ENV:', env);

dotenv.config({
    path: envPath
});

// Log das variáveis de ambiente do banco de dados
console.log('Configurações do banco de dados carregadas:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD ? '******' : 'undefined',
    DB_DATABASE: process.env.DB_DATABASE
});

// Tipo para as configurações
interface Config {
    // Servidor
    PORT: number;
    NODE_ENV: string;
    HOST: string;
   
    // Banco de dados
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
   
    // Autenticação
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_RESET_SECRET: string;
    JWT_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;
    JWT_RESET_EXPIRATION: string;
   
    // Redis (para cache e rate limiting)
    REDIS_URL: string;
   
    // Filas
    QUEUE_URL?: string;
   
    // Limites e taxas
    API_RATE_LIMIT: number;
    API_RATE_WINDOW_MS: number;
   
    // Configurações de log
    LOG_LEVEL: string;
    LOG_FORMAT: string;
    LOG_DIR: string;
    LOG_MAX_SIZE: string;
    LOG_MAX_FILES: string;
    LOG_SENTRY_LEVEL: string;
   
    // Integrações de monitoramento
    SENTRY_DSN?: string;

    // CORS
    ALLOWED_ORIGINS?: string;
}

// Configuração validada com valores padrão
const config: Config = {
    // Servidor
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: env,
    HOST: process.env.HOST || 'localhost',
   
    // Banco de dados
    DATABASE_URL: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_DATABASE || 'conexao_saudavel'}`,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_DATABASE: process.env.DB_DATABASE || 'conexao_saudavel',
   
    // Autenticação
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || 'default-reset-secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRES_IN || '1d',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    JWT_RESET_EXPIRATION: process.env.JWT_RESET_EXPIRATION || '1h',
   
    // Redis (para cache e rate limiting)
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
   
    // Filas
    QUEUE_URL: process.env.QUEUE_URL,
   
    // Limites e taxas
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || '100', 10),
    API_RATE_WINDOW_MS: parseInt(process.env.API_RATE_WINDOW_MS || '900000', 10), // 15 min
   
    // Configurações de log
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FORMAT: process.env.LOG_FORMAT || 'json',
    LOG_DIR: process.env.LOG_DIR || 'logs',
    LOG_MAX_SIZE: process.env.LOG_MAX_SIZE || '20m',
    LOG_MAX_FILES: process.env.LOG_MAX_FILES || '14d',
    LOG_SENTRY_LEVEL: process.env.LOG_SENTRY_LEVEL || 'error',
   
    // Integrações de monitoramento
    SENTRY_DSN: process.env.SENTRY_DSN,

    // CORS
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
};

console.log('NODE_ENV:', config.NODE_ENV);
console.log('Configurações do banco de dados carregadas:', {
    DB_HOST: config.DB_HOST,
    DB_PORT: config.DB_PORT,
    DB_USERNAME: config.DB_USERNAME,
    DB_PASSWORD: config.DB_PASSWORD ? '******' : undefined,
    DB_DATABASE: config.DB_DATABASE
});
console.log('Configurações do Banco de Dados:', {
    databaseUrl: config.DATABASE_URL ? '******' : undefined,
    nodeEnv: config.NODE_ENV,
});

export default config;