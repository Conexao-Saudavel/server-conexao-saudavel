import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateSchema } from '../middlewares/validation.middleware.js';
import { authSchemas, registerSchema } from '../validations/schemas.js';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();
const authController = new AuthController();

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
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     user_type:
 *                       $ref: '#/components/schemas/UserType'
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
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
    authController.login
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
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - full_name
 *               - date_of_birth
 *               - gender
 *               - institution_id
 *               - user_type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *                 minLength: 6
 *               full_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 $ref: '#/components/schemas/Gender'
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *               user_type:
 *                 $ref: '#/components/schemas/UserType'
 *               settings:
 *                 type: object
 *                 description: Configurações opcionais do usuário
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     user_type:
 *                       $ref: '#/components/schemas/UserType'
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/register',
    registerLimiter,
    validateSchema(registerSchema),
    authController.register.bind(authController)
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
    authController.refreshToken
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
    authController.forgotPassword
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
    authController.resetPassword
);

export default router; 