import type { Request, Response, NextFunction } from 'express';
import { BaseError, InternalServerError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

// Estender a interface Request para incluir o id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware para tratamento global de erros
 * 
 * Este middleware:
 * 1. Captura todos os erros não tratados
 * 2. Converte erros conhecidos para o formato padrão da API
 * 3. Registra logs apropriados baseado no tipo de erro
 * 4. Retorna respostas de erro padronizadas
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Se for um erro conhecido (estendendo BaseError)
  if (error instanceof BaseError) {
    // Log apropriado baseado no status code
    if (error.statusCode >= 500) {
      logger.error(`[${error.code}] ${error.message}`, {
        stack: error.stack,
        details: error.details,
        path: req.path,
        method: req.method,
        requestId: req.id
      });
    } else {
      logger.warn(`[${error.code}] ${error.message}`, {
        details: error.details,
        path: req.path,
        method: req.method,
        requestId: req.id
      });
    }

    // Retorna o erro no formato padronizado
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Para erros não tratados/desconhecidos
  logger.error('[UnhandledError] Erro não tratado', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  // Converte para erro interno do servidor
  const internalError = new InternalServerError(
    'Ocorreu um erro inesperado no servidor'
  );

  // Retorna o erro no formato padronizado
  res.status(internalError.statusCode).json(internalError.toJSON());
} 