import config from '../config/env.js';
import app from '../app.js';
import { AppDataSource } from '../config/migration-config.prod.js';
import { CacheService } from '../services/CacheService.js';
import { Server } from 'http';

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
        const port = parseInt(process.env.PORT || '3000', 10);
        console.log('Tentando iniciar servidor na porta:', port);

        // Função para tentar iniciar o servidor
        const startServerOnPort = (portToTry: number): Promise<Server> => {
            return new Promise((resolve, reject) => {
                const server = app.listen(portToTry, '0.0.0.0', () => {
                    const address = server.address();
                    const actualPort = typeof address === 'object' ? address?.port : portToTry;
                    console.log('Servidor iniciado com sucesso', {
                        context: 'server',
                        port: actualPort,
                        nodeEnv: process.env.NODE_ENV,
                        host: '0.0.0.0'
                    });
                    resolve(server);
                });

                server.on('error', (error: any) => {
                    if (error.code === 'EADDRINUSE') {
                        console.log(`Porta ${portToTry} em uso, tentando próxima porta...`);
                        reject(error);
                    } else {
                        console.error('Erro ao iniciar servidor:', error);
                        reject(error);
                    }
                });
            });
        };

        // Tenta iniciar o servidor com diferentes portas
        let server: Server;
        try {
            server = await startServerOnPort(port);
        } catch (error: any) {
            if (error.code === 'EADDRINUSE') {
                console.log('Tentando porta alternativa...');
                server = await startServerOnPort(0); // Deixa o sistema escolher uma porta disponível
            } else {
                throw error;
            }
        }

        // Tratamento de erros do servidor
        process.on('SIGTERM', () => {
            console.log('Sinal SIGTERM recebido. Encerrando servidor...');
            if (server) {
                server.close(() => {
                    console.log('Servidor encerrado com sucesso');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

        process.on('SIGINT', () => {
            console.log('Sinal SIGINT recebido. Encerrando servidor...');
            if (server) {
                server.close(() => {
                    console.log('Servidor encerrado com sucesso');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer(); 