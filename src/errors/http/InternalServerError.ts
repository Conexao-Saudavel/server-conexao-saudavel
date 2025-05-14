import { BaseError } from '../base/BaseError.js';

/**
 * Erro 500 - Internal Server Error
 * Usado para erros inesperados no servidor
 */
export class InternalServerError extends BaseError {
  constructor(
    message: string = 'Erro interno do servidor',
    details?: any
  ) {
    super(
      message,
      500,
      'INTERNAL_SERVER_ERROR',
      details
    );
  }
} 