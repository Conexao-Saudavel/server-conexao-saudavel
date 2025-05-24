import { DataSource } from 'typeorm';
import { User } from '../../entities/User.js';
import { Institution } from '../../entities/Institution.js';
import { Device } from '../../entities/Device.js';
import { AppUsage } from '../../entities/AppUsage.js';
import { DailySummary } from '../../entities/DailySummary.js';
import { UserSettings } from '../../entities/UserSettings.js';

/**
 * Cria uma conexão de teste com o banco de dados
 */
export async function createTestConnection(): Promise<DataSource> {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        username: process.env.TEST_DB_USERNAME || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        database: process.env.TEST_DB_DATABASE || 'conexao_saudavel_test',
        entities: [User, Institution, Device, AppUsage, DailySummary, UserSettings],
        synchronize: true, // Cria as tabelas automaticamente
        dropSchema: true, // Remove as tabelas antes de criar
        logging: false // Desativa logs SQL
    });

    try {
        await dataSource.initialize();
        console.log('Conexão de teste estabelecida com sucesso');
        return dataSource;
    } catch (error) {
        console.error('Erro ao estabelecer conexão de teste:', error);
        throw error;
    }
}

/**
 * Fecha a conexão de teste
 */
export async function closeTestConnection(dataSource: DataSource): Promise<void> {
    if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log('Conexão de teste fechada com sucesso');
    }
}

/**
 * Limpa todas as tabelas do banco de teste
 */
export async function clearTestDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    
    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
    }
    
    console.log('Banco de teste limpo com sucesso');
} 