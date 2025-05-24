import { Redis } from 'ioredis'
import { logger } from '../utils/logger.js';
import config from '../config/env.js';

export class CacheService {
    private redis: Redis;
    private prefix: string;
    private defaultTTL: number;

    constructor(prefix = 'app:', defaultTTL = 3600) {
        this.redis = new Redis(config.REDIS_URL, {
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            connectTimeout: 10000
        });
        this.prefix = prefix;
        this.defaultTTL = defaultTTL;

        this.redis.on('error', (error: Error) => {
            logger.error('Erro na conexão com Redis:', error);
        });

        this.redis.on('connect', () => {
            logger.info('Conexão com Redis estabelecida com sucesso');
        });
    }

    /**
     * Gera uma chave de cache
     */
    private generateKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    /**
     * Recupera dados do cache ou executa a função para gerar os dados
     */
    async getOrSet<T>(
        key: string,
        dataFn: () => Promise<T>,
        ttl: number = this.defaultTTL
    ): Promise<T> {
        const cacheKey = this.generateKey(key);

        try {
            // Tenta recuperar do cache
            const cachedData = await this.redis.get(cacheKey);
            if (cachedData) {
                logger.debug(`Cache hit para chave: ${cacheKey}`);
                return JSON.parse(cachedData);
            }

            // Se não encontrou, executa a função e armazena
            logger.debug(`Cache miss para chave: ${cacheKey}`);
            const data = await dataFn();
            await this.redis.set(cacheKey, JSON.stringify(data), 'EX', ttl);
            return data;
        } catch (error) {
            logger.error(`Erro ao acessar cache para chave ${cacheKey}:`, error);
            // Em caso de erro, executa a função diretamente
            return dataFn();
        }
    }

    /**
     * Invalida uma chave específica
     */
    async invalidate(key: string): Promise<void> {
        const cacheKey = this.generateKey(key);
        await this.redis.del(cacheKey);
        logger.debug(`Cache invalidado para chave: ${cacheKey}`);
    }

    /**
     * Invalida múltiplas chaves usando padrão
     */
    async invalidatePattern(pattern: string): Promise<void> {
        const keys = await this.redis.keys(this.generateKey(pattern));
        if (keys.length > 0) {
            await this.redis.del(...keys);
            logger.debug(`Cache invalidado para padrão: ${pattern}, ${keys.length} chaves afetadas`);
        }
    }

    /**
     * Limpa todo o cache do prefixo atual
     */
    async clearAll(): Promise<void> {
        const keys = await this.redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
            logger.info(`Cache limpo, ${keys.length} chaves removidas`);
        }
    }
} 