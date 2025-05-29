import "reflect-metadata";
import express from 'express';
import { setupSwagger } from './middlewares/swagger.middleware.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { corsMiddleware } from './config/cors.js';
import { sanitizeMiddleware } from './middlewares/sanitize.middleware.js';
import { sqlInjectionMiddleware } from './middlewares/sql-injection.middleware.js';
import { helmetConfig } from './config/helmet.js';
import { accessLoggerMiddleware } from './middlewares/access-logger.middleware.js';
import { metricsMiddleware } from './utils/metrics.js';
import { createLogger } from './utils/logger.js';
// import { requestLogger } from './middlewares/logging.middleware.js';
// import { metricsMiddleware } from './utils/metrics.js';

const logger = createLogger('server');
const app = express();

// Log inicial
logger.info('Iniciando configuração do servidor', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada',
    redisUrl: process.env.REDIS_URL ? 'Configurada' : 'Não configurada'
});

// Basic middlewares
app.use(helmetConfig);
app.use(corsMiddleware);
app.use(express.json());
app.use(sanitizeMiddleware());
app.use(sqlInjectionMiddleware);
app.use(accessLoggerMiddleware);
app.use(metricsMiddleware);
// app.use(requestLogger);
// app.use(metricsMiddleware);

// Configure Swagger
setupSwagger(app);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info('Servidor iniciado com sucesso', {
        port: PORT,
        nodeEnv: process.env.NODE_ENV,
        host: process.env.HOST || 'localhost'
    });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promessa rejeitada não tratada:', { reason, promise });
    process.exit(1);
});

export default app;