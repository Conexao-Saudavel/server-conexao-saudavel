
export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

/**
 * Erro 400 - Bad Request
 */
export class BadRequestError extends BaseError {
  constructor(message: string = 'Requisição inválida', details?: any) {
    super(message, 400, details);
  }
}

/**
 * Erro 401 - Unauthorized
 */
export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Não autorizado', details?: any) {
    super(message, 401, details);
  }
}

/**
 * Erro 403 - Forbidden
 */
export class ForbiddenError extends BaseError {
  constructor(message: string = 'Acesso negado', details?: any) {
    super(message, 403, details);
  }
}

/**
 * Erro 404 - Not Found
 */
export class NotFoundError extends BaseError {
  constructor(message: string = 'Recurso não encontrado', details?: any) {
    super(message, 404, details);
  }
}

/**
 * Erro 409 - Conflict
 */
export class ConflictError extends BaseError {
  constructor(message: string = 'Conflito', details?: any) {
    super(message, 409, details);
  }
}

/**
 * Erro 500 - Internal Server Error
 */
export class InternalServerError extends BaseError {
  constructor(message: string = 'Erro interno do servidor', details?: any) {
    super(message, 500, details);
  }
}

/**
 * Erro 503 - Service Unavailable
 */
export class ServiceUnavailableError extends BaseError {
  constructor(message: string = 'Serviço indisponível', details?: any) {
    super(message, 503, details);
  }
} 