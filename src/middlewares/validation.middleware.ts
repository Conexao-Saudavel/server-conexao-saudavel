import type { Request, Response, NextFunction } from 'express';
import type { Schema } from 'joi';
import Joi from 'joi';
import { BadRequestError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware factory que cria um middleware de validação para um schema Joi específico
 * @param schema Schema Joi para validação
 * @param target Propriedade do request a ser validada ('body', 'query', 'params')
 * @returns Middleware de validação
 */
export function validateSchema(schema: Schema, target: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Adiciona o ID da requisição ao contexto de validação
            const validationContext = {
                requestId: res.locals.requestId
            };

            // Valida os dados usando o schema
            const { error, value } = schema.validate(req[target], {
                abortEarly: false, // Retorna todos os erros, não apenas o primeiro
                stripUnknown: true, // Remove campos não definidos no schema
                context: validationContext
            });

            if (error) {
                // Formata os erros de validação
                const validationErrors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type
                }));

                // Log dos erros de validação
                logger.warn('Validation error', {
                    requestId: res.locals.requestId,
                    path: req.path,
                    method: req.method,
                    errors: validationErrors
                });

                throw new BadRequestError('Erro de validação', validationErrors);
            }

            // Substitui os dados originais pelos dados validados
            req[target] = value;
            
            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Middleware para validar parâmetros de paginação
 */
export const validatePagination = validateSchema(
    Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort_by: Joi.string(),
        sort_order: Joi.string().valid('asc', 'desc').default('asc')
    }),
    'query'
);

/**
 * Middleware para validar IDs UUID em parâmetros de rota
 */
export const validateUUID = validateSchema(
    Joi.object({
        id: Joi.string().uuid().required()
    }),
    'params'
);

/**
 * Middleware para validar filtros de data
 */
export const validateDateRange = validateSchema(
    Joi.object({
        start_date: Joi.date().iso().required(),
        end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
    }),
    'query'
); 