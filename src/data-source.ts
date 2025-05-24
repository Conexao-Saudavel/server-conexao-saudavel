import { DataSource } from 'typeorm';
import config from './config/env.js';
import { User } from './entities/User.js';
import { Institution } from './entities/Institution.js';
import { Device } from './entities/Device.js';
import { UserSettings } from './entities/UserSettings.js';
import { AppUsage } from './entities/AppUsage.js';
import { DailySummary } from './entities/DailySummary.js';
import { Seeder } from './seeds/index.js';

// Log das configurações do banco de dados
console.log('Configurações do Banco de Dados:', {
    databaseUrl: config.DATABASE_URL ? '******' : 'undefined',
    nodeEnv: config.NODE_ENV
});

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: config.DATABASE_URL,
    synchronize: config.NODE_ENV === 'development', // Não usar em produção!
    logging: config.NODE_ENV === 'development',
    entities: [User, Institution, Device, UserSettings, AppUsage, DailySummary],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000
    }
});

// Inicializa a conexão
AppDataSource.initialize()
    .then(async () => {
        console.log('Data Source inicializado com sucesso');
        
        // Executa os seeds em ambiente de desenvolvimento
        if (config.NODE_ENV === 'development') {
            try {
                const seeder = new Seeder(AppDataSource);
                await seeder.seed();
            } catch (error) {
                console.error('Erro ao executar seeds:', error);
            }
        }
    })
    .catch((error) => {
        console.error('Erro ao inicializar Data Source:', error);
        process.exit(1);
    }); 