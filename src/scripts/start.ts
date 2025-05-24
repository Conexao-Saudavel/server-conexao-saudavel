import config from '../config/env.js';
import app from '../app.js';
import { AppDataSource } from '../config/migration-config.prod.js';
import { CacheService } from '../services/CacheService.js';

async function startServer() {
    try {
        // Inicializa o Data Source
        await AppDataSource.initialize();
        console.log('Data Source inicializado com sucesso');

        // Executa as migrações pendentes
        await AppDataSource.runMigrations();
        console.log('Migrações executadas com sucesso');

        // Inicializa o serviço de cache
        await CacheService.initialize();
        console.log('Serviço de cache inicializado com sucesso');

        // Configura o servidor
        app.listen(process.env.PORT || 3000, () => {
            console.log('Servidor iniciado com sucesso', {
                context: 'server',
                port: process.env.PORT || 3000,
                nodeEnv: process.env.NODE_ENV,
                host: 'localhost'
            });
        });

        // Tratamento de erros do servidor
        process.on('SIGTERM', () => {
            console.log('Sinal SIGTERM recebido. Encerrando servidor...');
            process.exit(0);
        });

        process.on('SIGINT', () => {
            console.log('Sinal SIGINT recebido. Encerrando servidor...');
            process.exit(0);
        });

    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer(); 