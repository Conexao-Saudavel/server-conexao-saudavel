import type { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

// Configuração padrão de sanitização
const defaultOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt'],
    '*': ['class', 'id']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedClasses: {
    '*': ['text-*', 'bg-*', 'p-*', 'm-*', 'border-*']
  }
};

/**
 * Middleware para sanitizar dados de entrada
 * Remove HTML malicioso e mantém apenas tags e atributos seguros
 */
export const sanitizeMiddleware = (options = defaultOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      // Sanitiza strings no body
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key], options);
        }
      });
    }

    if (req.query) {
      // Sanitiza strings nos query params
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeHtml(req.query[key] as string, options);
        }
      });
    }

    if (req.params) {
      // Sanitiza strings nos route params
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeHtml(req.params[key], options);
        }
      });
    }

    next();
  };
}; 