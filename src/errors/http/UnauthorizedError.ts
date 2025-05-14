import { BaseError } from '../base/BaseError.js';

/**
 * Erro 401 - Unauthorized
 * Usado quando o usuário não está autenticado ou o token é inválido
 */
export class UnauthorizedError extends BaseError {
  constructor(
    message: string = 'Não autorizado',
    details?: any
  ) {
    super(
      message,
      401,
      'UNAUTHORIZED',
      details
    );
  }
} 