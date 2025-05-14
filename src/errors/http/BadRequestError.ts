import { BaseError } from '../base/BaseError.js';

/**
 * Erro 400 - Bad Request
 * Usado quando a requisição contém dados inválidos ou mal formatados
 */
export class BadRequestError extends BaseError {
  constructor(
    message: string = 'Requisição inválida',
    details?: any
  ) {
    super(
      message,
      400,
      'BAD_REQUEST',
      details
    );
  }
} 