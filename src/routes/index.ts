import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import reflectionRoutes from './reflection.routes.js';

const router = Router();

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
router.use('/users', userRoutes);
router.use('/reflections', reflectionRoutes);

export default router; 