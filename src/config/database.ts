import { DataSource } from 'typeorm';
import config from './env.js';
import { User } from '../entities/User.js';
import { Institution } from '../entities/Institution.js';
import { Device } from '../entities/Device.js';
import { UserSettings } from '../entities/UserSettings.js';
import { AppUsage } from '../entities/AppUsage.js';
import { DailySummary } from '../entities/DailySummary.js';

const dbHost = config.NODE_ENV === 'development' ? 'conexao-saudavel-db' : config.DB_HOST;

const dataSource = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    synchronize: false, // Nunca usar synchronize em migrations
    logging: config.NODE_ENV === 'development',
    entities: [User, Institution, Device, UserSettings, AppUsage, DailySummary],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000
    }
});

export default dataSource; 