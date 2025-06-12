import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ReflectionController } from '../controllers/ReflectionController.js';
import { validateSchema } from '../middlewares/validation.middleware.js';
import Joi from 'joi';

const router = Router();
const controller = new ReflectionController();

// Validação para criação de reflexão
const createReflectionSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

router.use(authMiddleware);

router.post('/', validateSchema(createReflectionSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router; 