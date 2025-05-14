import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';
import config from '../config/env.js';
import { logger } from '../utils/logger.js';
import { InternalServerError } from '../errors/index.js';

// Cliente Redis para armazenamento dos limites
const redis = new Redis(config.REDIS_URL, {
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
});

// Tratamento de erros do Redis
redis.on('error', (error: Error) => {
    logger.error('Erro na conexão com Redis', {
        error: error.message,
        stack: error.stack
    });
});

// Configurações comuns para os limitadores
const defaultOptions = {
    store: new RedisStore({
        // @ts-ignore - O tipo RedisStore está desatualizado
        client: redis,
        prefix: 'rate-limit:',
        // @ts-ignore - O tipo SendCommandFn está desatualizado
        sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args)
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            requestId: res.locals.requestId
        });

        res.status(429).json({
            error: 'TooManyRequests',
            message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
            retry_after: Math.ceil(config.API_RATE_WINDOW_MS / 1000)
        });
    }
};

// Tipo para o gerador de chaves
type KeyGenerator = (req: Request) => string;

/**
 * Limitador para rotas de autenticação
 * 10 tentativas por 15 minutos
 */
export const authLimiter = rateLimit({
    ...defaultOptions,
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas
    keyGenerator: ((req: Request): string => req.ip || 'unknown') as KeyGenerator,
    skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
    message: {
        error: 'TooManyRequests',
        message: 'Muitas tentativas de login. Por favor, tente novamente mais tarde.',
        retry_after: 15 * 60
    }
});

/**
 * Limitador para rotas de registro
 * 5 tentativas por hora
 */
export const registerLimiter = rateLimit({
    ...defaultOptions,
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 tentativas
    keyGenerator: ((req: Request): string => req.ip || 'unknown') as KeyGenerator,
    message: {
        error: 'TooManyRequests',
        message: 'Muitas tentativas de registro. Por favor, tente novamente mais tarde.',
        retry_after: 60 * 60
    }
});

/**
 * Limitador para rotas de recuperação de senha
 * 3 tentativas por hora
 */
export const passwordResetLimiter = rateLimit({
    ...defaultOptions,
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 tentativas
    keyGenerator: ((req: Request): string => req.ip || 'unknown') as KeyGenerator,
    message: {
        error: 'TooManyRequests',
        message: 'Muitas tentativas de recuperação de senha. Por favor, tente novamente mais tarde.',
        retry_after: 60 * 60
    }
});

/**
 * Limitador geral da API
 * 100 requisições por 15 minutos
 */
export const apiLimiter = rateLimit({
    ...defaultOptions,
    windowMs: config.API_RATE_WINDOW_MS,
    max: config.API_RATE_LIMIT,
    keyGenerator: ((req: Request): string => {
        // Use IP + user_id se disponível
        const ip = req.ip || 'unknown';
        return req.user?.id 
            ? `${ip}:${req.user.id}`
            : ip;
    }) as KeyGenerator
}); 