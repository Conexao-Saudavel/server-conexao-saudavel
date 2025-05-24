import { BaseError } from '../base/BaseError.js';

/**
 * Erro 404 - Not Found
 * Usado quando o recurso solicitado não existe
 */
export class NotFoundError extends BaseError {
  constructor(
    message: string = 'Recurso não encontrado',
    details?: any
  ) {
    super(
      message,
      404,
      'NOT_FOUND',
      details
    );
  }
} 