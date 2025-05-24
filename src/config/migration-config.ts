import { DataSource } from 'typeorm';
import config from './env.js';

const dbHost = config.NODE_ENV === 'development' ? 'conexao-saudavel-db' : config.DB_HOST;

export default new DataSource({
    type: 'postgres',
    host: dbHost,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    synchronize: false,
    logging: config.NODE_ENV === 'development',
    entities: ['src/entities/*.ts'],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000
    }
}); 