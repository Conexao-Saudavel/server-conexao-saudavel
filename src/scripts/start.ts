import { AppDataSource } from '../config/migration-config.prod.js';
import app from '../app.js';
import config from '../config/env.js';

async function startServer() {
    try {
        // Inicializa o banco de dados
        await AppDataSource.initialize();
        console.log('Banco de dados inicializado com sucesso');

        // Executa migrações pendentes
        await AppDataSource.runMigrations();
        console.log('Migrações executadas com sucesso');

        // Inicia o servidor
        const port = config.PORT;
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer(); 