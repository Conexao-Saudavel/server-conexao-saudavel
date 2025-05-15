import { DataSource } from 'typeorm';
import config from './config/env.js';
import { User } from './entities/User.js';
import { Institution } from './entities/Institution.js';
import { Device } from './entities/Device.js';
import { UserSettings } from './entities/UserSettings.js';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    synchronize: config.NODE_ENV === 'development', // Não usar em produção!
    logging: config.NODE_ENV === 'development',
    entities: [User, Institution, Device, UserSettings],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Inicializa a conexão
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source inicializado com sucesso');
    })
    .catch((error) => {
        console.error('Erro ao inicializar Data Source:', error);
        process.exit(1);
    }); 