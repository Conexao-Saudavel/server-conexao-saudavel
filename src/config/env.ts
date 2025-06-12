import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente apropriadas
const env = process.env.NODE_ENV || 'development';

// Em produção, não carrega arquivo .env
if (env !== 'production') {
    const envPath = path.resolve(__dirname, `../../.env.${env}`);
    console.log('Carregando variáveis de ambiente de:', envPath);
    dotenv.config({ path: envPath });
}

console.log('Inicializando configurações:', {
    nodeEnv: env,
    isProduction: env === 'production'
});

// Log das variáveis de ambiente do banco de dados
console.log('Configurações do banco de dados carregadas:', {
    DATABASE_URL: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada',
    REDIS_URL: process.env.REDIS_URL ? 'Configurada' : 'Não configurada'
});

// Tipo para as configurações
interface Config {
    // Servidor
    PORT: number;
    NODE_ENV: string;
   
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
   
    // Banco de dados
    DATABASE_URL: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_DATABASE || 'conexao_saudavel'}`,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_DATABASE: process.env.DB_DATABASE || 'conexao_saudavel',
   
    // Autenticação
    JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || 'default-reset-secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
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

export default config;