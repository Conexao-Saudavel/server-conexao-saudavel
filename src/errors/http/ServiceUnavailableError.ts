import { BaseError } from '../base/BaseError.js';

/**
 * Erro 503 - Service Unavailable
 * Usado quando o serviço está temporariamente indisponível
 */
export class ServiceUnavailableError extends BaseError {
  constructor(
    message: string = 'Serviço temporariamente indisponível',
    details?: any
  ) {
    super(
      message,
      503,
      'SERVICE_UNAVAILABLE',
      details
    );
  }
} 