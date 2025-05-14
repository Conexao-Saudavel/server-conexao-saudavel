import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente apropriadas
const env = process.env.NODE_ENV || 'development';
dotenv.config({
    path: path.resolve(__dirname, `../../.env.${env}`)
});

// Configuração validada com valores padrão
export const config = {
    // Servidor
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: env,
    
    // Banco de dados
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    
    // Autenticação
    JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || 'default-reset-secret',
    SYNC_SECRET_KEY: process.env.SYNC_SECRET_KEY || 'default-sync-secret',
    
    // Redis (para cache)
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    
    // Filas
    QUEUE_URL: process.env.QUEUE_URL,
    
    // Limites e taxas
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || '100', 10),
    API_RATE_WINDOW_MS: parseInt(process.env.API_RATE_WINDOW_MS || '900000', 10), // 15 min
    
    // Configurações de log
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Integrações de monitoramento
    SENTRY_DSN: process.env.SENTRY_DSN
} as const;

// Tipo para as configurações
export type Config = typeof config;

// Exporta as configurações
export default config; 