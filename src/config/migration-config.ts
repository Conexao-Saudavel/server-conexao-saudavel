import { DataSource } from 'typeorm';
import config from './env.js';

const isProduction = config.NODE_ENV === 'production';

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    entities: isProduction ? ['dist/entities/*.js'] : ['src/entities/*.ts'],
    migrations: isProduction ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
    subscribers: isProduction ? ['dist/subscribers/*.js'] : ['src/subscribers/*.ts'],
    synchronize: false,
    logging: !isProduction
}); 