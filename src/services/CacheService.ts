import Redis from 'ioredis';
import config from '../config/env.js';

class CacheService {
    private static instance: any;
    private static prefix: string = 'app:';
    private static defaultTTL: number = 3600;

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

    private static generateKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    public static async getOrSet<T>(
        key: string,
        dataFn: () => Promise<T>,
        ttl: number = this.defaultTTL
    ): Promise<T> {
        const cacheKey = this.generateKey(key);

        try {
            // Tenta recuperar do cache
            const cachedData = await this.instance.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit para chave: ${cacheKey}`);
                return JSON.parse(cachedData);
            }

            // Se não encontrou, executa a função e armazena
            console.log(`Cache miss para chave: ${cacheKey}`);
            const data = await dataFn();
            await this.instance.set(cacheKey, JSON.stringify(data), 'EX', ttl);
            return data;
        } catch (error) {
            console.error(`Erro ao acessar cache para chave ${cacheKey}:`, error);
            // Em caso de erro, executa a função diretamente
            return dataFn();
        }
    }

    public static async invalidate(key: string): Promise<void> {
        const cacheKey = this.generateKey(key);
        await this.instance.del(cacheKey);
        console.log(`Cache invalidado para chave: ${cacheKey}`);
    }

    public static async invalidatePattern(pattern: string): Promise<void> {
        const keys = await this.instance.keys(this.generateKey(pattern));
        if (keys.length > 0) {
            await this.instance.del(...keys);
            console.log(`Cache invalidado para padrão: ${pattern}, ${keys.length} chaves afetadas`);
        }
    }

    public static async clearAll(): Promise<void> {
        const keys = await this.instance.keys(`${this.prefix}*`);
        if (keys.length > 0) {
            await this.instance.del(...keys);
            console.log(`Cache limpo, ${keys.length} chaves removidas`);
        }
    }
}

export { CacheService }; 