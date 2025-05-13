import winston from 'winston';
import { env } from '../config/env';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuração do logger
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'conexao-saudavel-api' },
  transports: [
    // Console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? 
            `\n${JSON.stringify(meta, null, 2)}` : '';
          return `[${timestamp}] ${service} ${level}: ${message}${metaStr}`;
        })
      )
    })
  ]
});

// Adiciona transporte de arquivo em produção
if (env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
}

// Integração com Sentry em produção
if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE || 0.2,
  });
  
  // Middleware para integrar logs com Sentry
  logger.on('error', (error) => {
    Sentry.captureException(error);
  });
} 