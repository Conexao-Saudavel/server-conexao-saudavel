import { DataSource } from 'typeorm';
import config from './env.js';
import { User, Device, UserSettings, Institution, DailySummary, AppUsage, Role, Permission } from '../entities/index.js';

// Configuração do DataSource para produção
export const AppDataSource = new DataSource({
    type: 'postgres',
    url: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [User, Device, UserSettings, Institution, DailySummary, AppUsage, Role, Permission],
    synchronize: false,
    logging: false, // Desativa logs em produção
    migrations: ['dist/migrations/*.js'],
    migrationsRun: false, // Desativa execução automática de migrações
    migrationsTableName: 'migrations',
    extra: {
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000,
        ssl: {
            rejectUnauthorized: false
        }
    }
});

// Função para inicializar o DataSource
async function initializeDataSource() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Data Source:', error);
        process.exit(1);
    }
}

// Inicializa o DataSource
initializeDataSource(); 