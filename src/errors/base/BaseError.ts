export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly code: string;

  constructor(
    message: string, 
    statusCode: number, 
    code: string,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converte o erro para um formato padronizado de resposta da API
   */
  public toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }
} 