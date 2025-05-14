import { BaseError } from '../base/BaseError.js';

/**
 * Erro 409 - Conflict
 * Usado quando há conflito com o estado atual do recurso
 */
export class ConflictError extends BaseError {
  constructor(
    message: string = 'Conflito com o estado atual do recurso',
    details?: any
  ) {
    super(
      message,
      409,
      'CONFLICT',
      details
    );
  }
} 