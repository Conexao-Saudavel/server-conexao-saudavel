import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import reflectionRoutes from './reflection.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (requerem autenticação)
router.use('/users', userRoutes);
router.use('/reflections', reflectionRoutes);

export default router; 