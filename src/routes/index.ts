import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
router.use('/users', userRoutes);

export default router; 