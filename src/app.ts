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
import dataSource from './config/database.js';
// import { requestLogger } from './middlewares/logging.middleware.js';
// import { metricsMiddleware } from './utils/metrics.js';

const logger = createLogger('server');
const app = express();

// Log inicial
logger.info('Iniciando configuração do servidor', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada',
    redisUrl: process.env.REDIS_URL ? 'Configurada' : 'Não configurada',
    cwd: process.cwd(),
    files: {
        app: process.cwd() + '/dist/app.js',
        routes: process.cwd() + '/dist/routes/index.js'
    }
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

// Função para iniciar o servidor
async function startServer() {
    try {
        // Aguarda a conexão com o banco de dados
        if (!dataSource.isInitialized) {
            logger.info('Iniciando conexão com o banco de dados...');
            await dataSource.initialize();
            logger.info('Conexão com o banco de dados estabelecida com sucesso');
        }

        // Inicia o servidor
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
            server.close(() => process.exit(1));
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Promessa rejeitada não tratada:', { reason, promise });
            server.close(() => process.exit(1));
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM recebido. Encerrando servidor...');
            server.close(() => {
                logger.info('Servidor encerrado');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer();

export default app;