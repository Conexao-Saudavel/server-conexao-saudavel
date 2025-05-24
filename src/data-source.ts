import { DataSource } from 'typeorm';
import config from './config/env.js';
import { User } from './entities/User.js';
import { Institution } from './entities/Institution.js';
import { Device } from './entities/Device.js';
import { UserSettings } from './entities/UserSettings.js';
import { AppUsage } from './entities/AppUsage.js';
import { DailySummary } from './entities/DailySummary.js';
import { Seeder } from './seeds/index.js';

// Ajusta o host para usar o nome do serviço Docker em ambiente de desenvolvimento
const dbHost = config.NODE_ENV === 'development' ? 'conexao-saudavel-db' : config.DB_HOST;

// Log das configurações do banco de dados
console.log('Configurações do Banco de Dados:', {
    host: dbHost,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD ? '******' : 'undefined',
    database: config.DB_DATABASE,
    nodeEnv: config.NODE_ENV
});

// Log da string de conexão (sem a senha)
const connectionString = `postgresql://${config.DB_USERNAME}@${dbHost}:${config.DB_PORT}/${config.DB_DATABASE}`;
console.log('String de conexão (sem senha):', connectionString);

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    synchronize: config.NODE_ENV === 'development', // Não usar em produção!
    logging: config.NODE_ENV === 'development',
    entities: [User, Institution, Device, UserSettings, AppUsage, DailySummary],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
    ssl: config.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    extra: {
        // Adiciona um timeout maior para a conexão
        connectionTimeoutMillis: 10000,
        // Adiciona um pool de conexões
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
        // Log mais detalhado do erro
        if (error.code === '28P01') {
            console.error('Erro de autenticação. Verifique se as credenciais estão corretas:');
            console.error('- Usuário:', config.DB_USERNAME);
            console.error('- Banco:', config.DB_DATABASE);
            console.error('- Host:', dbHost);
            console.error('- Porta:', config.DB_PORT);
        }
        process.exit(1);
    }); 