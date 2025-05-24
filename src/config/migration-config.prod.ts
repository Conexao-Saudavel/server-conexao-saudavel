import { DataSource } from 'typeorm';
import config from './env.js';
import { User, Device, UserSettings, Institution, DailySummary, AppUsage, Role, Permission } from '../entities/index.js';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [User, Device, UserSettings, Institution, DailySummary, AppUsage, Role, Permission],
    synchronize: false,
    logging: config.NODE_ENV === 'development',
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true,
    migrationsTableName: 'migrations'
}); 