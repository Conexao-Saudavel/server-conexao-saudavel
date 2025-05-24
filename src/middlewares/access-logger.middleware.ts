import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('access-logger');

/**
 * Middleware para registrar logs de acesso
 * Registra informações detalhadas sobre cada requisição HTTP
 */
export const accessLoggerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Gera ID único para a requisição
  const requestId = uuidv4();
  req.id = requestId;
  res.locals.requestId = requestId;

  // Captura o tempo de início da requisição
  const startTime = Date.now();

  // Função para registrar o log após a resposta
  const logResponse = () => {
    // Calcula o tempo de resposta
    const responseTime = Date.now() - startTime;

    // Obtém informações da requisição
    const requestInfo = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      contentLength: res.get('content-length'),
      contentType: res.get('content-type'),
      query: req.query,
      params: req.params,
      headers: {
        referer: req.get('referer'),
        origin: req.get('origin'),
        host: req.get('host')
      }
    };

    // Determina o nível do log baseado no status code
    const logLevel = res.statusCode >= 500 ? 'error' :
                    res.statusCode >= 400 ? 'warn' :
                    'info';

    // Registra o log com o nível apropriado
    logger[logLevel](
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`,
      requestInfo
    );
  };

  // Registra o log quando a resposta terminar
  res.on('finish', logResponse);

  next();
}; 