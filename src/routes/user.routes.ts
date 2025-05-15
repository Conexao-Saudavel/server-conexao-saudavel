import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validation.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Obtém dados do usuário logado
 *     description: Retorna os dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 user_type:
 *                   $ref: '#/components/schemas/UserType'
 *                 institution_id:
 *                   type: string
 *                   format: uuid
 *                 active:
 *                   type: boolean
 *                 onboarding_completed:
 *                   type: boolean
 *                 settings:
 *                   type: object
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', (req, res) => {
  // Temos o req.user disponível graças ao authMiddleware
  return res.json(req.user);
});

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags:
 *       - Usuários
 *     summary: Atualiza dados do usuário logado
 *     description: Atualiza os dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               gender:
 *                 $ref: '#/components/schemas/Gender'
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/me', validateSchema(updateUserSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    const userId = req.user.id;
    const { full_name, gender, settings } = req.body;

    // Atualizando usuário no repositório
    const userRepository = req.app.locals.repositories.userRepository;
    const updatedUser = await userRepository.update(userId, {
      full_name,
      gender,
      settings
    });

    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /users/me/stats:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Obtém estatísticas de uso do usuário
 *     description: Retorna estatísticas detalhadas de uso de aplicativos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
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
 *                 usage_stats:
 *                   type: object
 *                   properties:
 *                     total_screen_time:
 *                       type: string
 *                       example: "02:30:00"
 *                     app_breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           app_name:
 *                             type: string
 *                           duration:
 *                             type: string
 *                           percentage:
 *                             type: number
 *                     engagement_metrics:
 *                       type: object
 *                       properties:
 *                         total_sessions:
 *                           type: number
 *                         average_session_duration:
 *                           type: string
 *                         most_used_app:
 *                           type: string
 *                         most_used_category:
 *                           type: string
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me/stats', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    const userId = req.user.id;

    // Obtendo o serviço de estatísticas
    const statsService = req.app.locals.services.statsService;

    // Obtendo estatísticas do usuário
    const stats = await statsService.getUserStats(userId);

    return res.json({
      user: req.user,
      usage_stats: stats
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @swagger
 * /users/me/onboarding:
 *   post:
 *     tags:
 *       - Usuários
 *     summary: Marca onboarding como concluído
 *     description: Atualiza o status de onboarding do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding marcado como concluído
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Onboarding concluído com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     onboarding_completed:
 *                       type: boolean
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/me/onboarding', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    const userId = req.user.id;

    // Atualizando status de onboarding
    const userRepository = req.app.locals.repositories.userRepository;
    const updatedUser = await userRepository.update(userId, {
      onboarding_completed: true
    });

    return res.json({
      message: 'Onboarding concluído com sucesso',
      user: {
        id: updatedUser.id,
        onboarding_completed: updatedUser.onboarding_completed
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
