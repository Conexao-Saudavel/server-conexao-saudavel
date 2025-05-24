import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateSchema } from '../middlewares/validation.middleware.js';
import { authSchemas, registerSchema } from '../validations/schemas.js';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const authController = new AuthController();

// Bind all controller methods to maintain 'this' context
const boundController = {
    login: authController.login.bind(authController),
    register: authController.register.bind(authController),
    refreshToken: authController.refreshToken.bind(authController),
    forgotPassword: authController.forgotPassword.bind(authController),
    resetPassword: authController.resetPassword.bind(authController)
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza login no sistema
 *     description: Autentica um usuário e retorna tokens de acesso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/login',
    authLimiter,
    validateSchema(authSchemas.login),
    boundController.login
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Registra um novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas tentativas de registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/register',
    registerLimiter,
    validateSchema(registerSchema),
    boundController.register
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Renova o token de acesso
 *     description: Gera um novo token de acesso usando o refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       401:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/refresh-token',
    validateSchema(authSchemas.refreshToken),
    boundController.refreshToken
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Solicita recuperação de senha
 *     description: Envia um email com instruções para redefinir a senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de recuperação enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email de recuperação enviado com sucesso
 *       404:
 *         description: Email não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/forgot-password',
    authLimiter,
    validateSchema(authSchemas.forgotPassword),
    boundController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Redefine a senha do usuário
 *     description: Atualiza a senha usando o token de recuperação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/reset-password',
    passwordResetLimiter,
    validateSchema(authSchemas.resetPassword),
    boundController.resetPassword
);

export default router; 