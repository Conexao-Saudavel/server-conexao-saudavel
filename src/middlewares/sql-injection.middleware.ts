import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

// Padrões comuns de SQL Injection
const sqlInjectionPatterns = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Comentários SQL
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // Operadores SQL
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // OR
  /((\%27)|(\'))union/i, // UNION
  /exec(\s|\+)+(s|x)p\w+/i, // Execução de stored procedures
  /insert|update|delete|drop|truncate|alter/i // Comandos DML/DDL
];

/**
 * Middleware para proteção contra SQL Injection
 * Verifica se há padrões suspeitos nos parâmetros da requisição
 */
export const sqlInjectionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Função para verificar um valor
    const checkValue = (value: string): boolean => {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    // Verifica query parameters
    for (const key in req.query) {
      const value = req.query[key] as string;
      if (checkValue(value)) {
        throw new BadRequestError('Parâmetros de consulta inválidos');
      }
    }

    // Verifica body parameters
    for (const key in req.body) {
      const value = req.body[key];
      if (typeof value === 'string' && checkValue(value)) {
        throw new BadRequestError('Parâmetros do corpo inválidos');
      }
    }

    // Verifica route parameters
    for (const key in req.params) {
      const value = req.params[key];
      if (checkValue(value)) {
        throw new BadRequestError('Parâmetros de rota inválidos');
      }
    }

    next();
  } catch (error) {
    // Log da tentativa de SQL Injection
    logger.warn('Tentativa de SQL Injection detectada', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body,
      params: req.params
    });

    next(error);
  }
}; 