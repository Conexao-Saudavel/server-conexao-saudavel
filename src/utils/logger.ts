import winston from 'winston';
import 'winston-daily-rotate-file';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { 
    service: 'conexao-saudavel-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, environment, ...meta }) => {
          const metaStr = Object.keys(meta).length ? 
            `\n${JSON.stringify(meta, null, 2)}` : '';
          return `[${timestamp}] ${service} [${environment}] ${level}: ${message}${metaStr}`;
        })
      )
    })
  ]
});

// Configuração de rotação de logs
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: `${process.env.LOG_DIR || 'logs'}/application-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: customFormat
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: `${process.env.LOG_DIR || 'logs'}/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  level: 'error',
  format: customFormat
});

// Adiciona transporte de arquivo em produção
if (process.env.NODE_ENV === 'production') {
  logger.add(fileRotateTransport);
  logger.add(errorRotateTransport);
}

// Integração com Sentry para produção
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
  });
  
  // Middleware para integrar logs com Sentry
  logger.on('error', (error) => {
    if (process.env.LOG_SENTRY_LEVEL === 'error') {
      Sentry.captureException(error);
    }
  });
}

// Método helper para criar um logger com contexto
export const createLogger = (context: string) => {
  return logger.child({ context });
}; 