import type { Request, Response, NextFunction } from 'express';
import { BaseError, InternalServerError } from '../errors/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('error-handler');

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
  const requestId = req.id || 'unknown';
  const errorContext = {
    requestId,
    path: req.path,
    method: req.method,
    query: req.query,
    params: req.params,
    body: req.body,
    user: req.user,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };

  // Se for um erro conhecido (estendendo BaseError)
  if (error instanceof BaseError) {
    // Log apropriado baseado no status code
    if (error.statusCode >= 500) {
      logger.error(`[${error.code}] ${error.message}`, {
        ...errorContext,
        stack: error.stack,
        details: error.details,
        errorCode: error.code,
        statusCode: error.statusCode
      });
    } else {
      logger.warn(`[${error.code}] ${error.message}`, {
        ...errorContext,
        details: error.details,
        errorCode: error.code,
        statusCode: error.statusCode
      });
    }

    // Retorna o erro no formato padronizado
    res.status(error.statusCode).json({
      ...error.toJSON(),
      requestId
    });
    return;
  }

  // Para erros não tratados/desconhecidos
  logger.error('[UnhandledError] Erro não tratado', {
    ...errorContext,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });

  // Converte para erro interno do servidor
  const internalError = new InternalServerError(
    'Ocorreu um erro inesperado no servidor'
  );

  // Retorna o erro no formato padronizado
  res.status(internalError.statusCode).json({
    ...internalError.toJSON(),
    requestId
  });
} 