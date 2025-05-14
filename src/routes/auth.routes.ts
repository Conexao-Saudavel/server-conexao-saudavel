import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateSchema } from '../middlewares/validation.middleware.js';
import { authSchemas, registerSchema } from '../validations/schemas.js';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/login
 * @desc Autenticação de usuário
 * @access Public
 */
router.post(
    '/login',
    authLimiter,
    validateSchema(authSchemas.login),
    authController.login
);

/**
 * @route POST /auth/register
 * @desc Registro de novo usuário
 * @access Public
 */
router.post(
    '/register',
    registerLimiter,
    validateSchema(registerSchema),
    authController.register.bind(authController)
);

/**
 * @route POST /auth/refresh-token
 * @desc Renovação do token de acesso
 * @access Public
 */
router.post(
    '/refresh-token',
    validateSchema(authSchemas.refreshToken),
    authController.refreshToken
);

/**
 * @route POST /auth/forgot-password
 * @desc Solicitação de recuperação de senha
 * @access Public
 */
router.post(
    '/forgot-password',
    authLimiter,
    validateSchema(authSchemas.forgotPassword),
    authController.forgotPassword
);

/**
 * @route POST /auth/reset-password
 * @desc Redefinição de senha
 * @access Public
 */
router.post(
    '/reset-password',
    passwordResetLimiter,
    validateSchema(authSchemas.resetPassword),
    authController.resetPassword
);

export default router; 