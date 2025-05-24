/**
 * Arquivo de barril (barrel file) para exportar todas as classes de erro
 */

// Erro base
export { BaseError } from './base/BaseError.js';

// Erros HTTP
export { BadRequestError } from './http/BadRequestError.js';
export { UnauthorizedError } from './http/UnauthorizedError.js';
export { ForbiddenError } from './http/ForbiddenError.js';
export { NotFoundError } from './http/NotFoundError.js';
export { ConflictError } from './http/ConflictError.js';
export { InternalServerError } from './http/InternalServerError.js';
export { ServiceUnavailableError } from './http/ServiceUnavailableError.js'; 