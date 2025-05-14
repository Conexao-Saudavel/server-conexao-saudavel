import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

// Tipagem para o payload do JWT
export interface JWTPayload {
  id: string;
  institution_id: string;
  user_type: string;
  email: string;
  iat: number;
  exp: number;
}

// Estende a interface Request do Express para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica o token JWT no header Authorization e injeta o payload no req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verifica se o header Authorization existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Token não fornecido');
    }

    // Verifica o formato do token (Bearer TOKEN)
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || !/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer TOKEN');
    }

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

      // Validações adicionais do payload
      if (!decoded.id || !decoded.institution_id || !decoded.user_type) {
        throw new UnauthorizedError('Token inválido: payload incompleto');
      }

      // Verifica se o token expirou
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw new UnauthorizedError('Token expirado');
      }

      // Injeta o payload no request
      req.user = decoded;

      // Log de sucesso (apenas em desenvolvimento)
      if (config.NODE_ENV === 'development') {
        logger.debug('Autenticação bem-sucedida', {
          userId: decoded.id,
          userType: decoded.user_type,
          institutionId: decoded.institution_id
        });
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido');
      }
      throw error;
    }
  } catch (error) {
    // Log do erro
    logger.warn('Falha na autenticação', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    next(error);
  }
};

/**
 * Middleware para verificar roles/permissões específicas
 * @param allowedRoles Array de roles permitidas
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!allowedRoles.includes(req.user.user_type)) {
      throw new ForbiddenError(
        `Acesso negado. Roles permitidas: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário pertence à instituição
 * @param institutionId ID da instituição
 */
export const requireInstitution = (institutionId: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (req.user.institution_id !== institutionId) {
      throw new ForbiddenError('Acesso negado: usuário não pertence à instituição');
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário é o próprio dono do recurso
 * @param userId ID do usuário
 */
export const requireOwnership = (userId: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    // Permite acesso se for o próprio usuário ou um admin
    if (req.user.id !== userId && req.user.user_type !== 'admin') {
      throw new ForbiddenError('Acesso negado: usuário não é o dono do recurso');
    }

    next();
  };
}; 