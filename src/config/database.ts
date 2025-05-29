import { DataSource } from 'typeorm';
import config from './env.js';
import { User } from '../entities/User.js';
import { Institution } from '../entities/Institution.js';
import { Device } from '../entities/Device.js';
import { UserSettings } from '../entities/UserSettings.js';
import { AppUsage } from '../entities/AppUsage.js';
import { DailySummary } from '../entities/DailySummary.js';

// Configuração do banco de dados
const dataSource = new DataSource({
    type: 'postgres',
    // Se DATABASE_URL estiver definida, usa ela. Caso contrário, usa as variáveis individuais
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'conexao-saudavel-db'),
    port: process.env.DATABASE_URL ? undefined : config.DB_PORT,
    username: process.env.DATABASE_URL ? undefined : config.DB_USERNAME,
    password: process.env.DATABASE_URL ? undefined : config.DB_PASSWORD,
    database: process.env.DATABASE_URL ? undefined : config.DB_DATABASE,
    synchronize: false, // Nunca usar synchronize em migrations
    logging: config.NODE_ENV === 'development',
    entities: [User, Institution, Device, UserSettings, AppUsage, DailySummary],
    migrations: [config.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
    subscribers: [config.NODE_ENV === 'production' ? 'dist/subscribers/*.js' : 'src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000
    }
});

export default dataSource; 