import Redis from 'ioredis';
import config from '../config/env.js';

class CacheService {
    private static instance: any;

    public static async initialize(): Promise<void> {
        try {
            // Simplificando ao máximo a instanciação do Redis
            this.instance = new (Redis as any)(config.REDIS_URL);
            
            this.instance.on('connect', () => {
                console.log('Conexão com Redis estabelecida com sucesso');
            });

            this.instance.on('error', (error: Error) => {
                console.error('Erro na conexão com Redis:', error);
            });

            // Testa a conexão
            await this.instance.ping();
        } catch (error) {
            console.error('Erro ao inicializar Redis:', error);
            throw error;
        }
    }

    public static getInstance(): any {
        if (!this.instance) {
            throw new Error('CacheService não foi inicializado');
        }
        return this.instance;
    }
}

export { CacheService }; 