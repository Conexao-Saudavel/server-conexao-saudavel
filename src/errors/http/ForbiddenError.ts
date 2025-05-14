import { BaseError } from '../base/BaseError.js';

/**
 * Erro 403 - Forbidden
 * Usado quando o usuário está autenticado mas não tem permissão
 */
export class ForbiddenError extends BaseError {
  constructor(
    message: string = 'Acesso negado',
    details?: any
  ) {
    super(
      message,
      403,
      'FORBIDDEN',
      details
    );
  }
} 