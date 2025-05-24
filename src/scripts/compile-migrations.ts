import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // Compila as migrações
    console.log('Compilando migrações...');
    execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });
    
    // Cria o diretório de migrações se não existir
    const migrationsDir = path.resolve(__dirname, '../../dist/migrations');
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Copia as migrações compiladas
    console.log('Copiando migrações compiladas...');
    const srcMigrationsDir = path.resolve(__dirname, '../migrations');
    const files = fs.readdirSync(srcMigrationsDir);
    
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const sourcePath = path.join(srcMigrationsDir, file);
            const targetPath = path.join(migrationsDir, file);
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copiado: ${file}`);
        }
    });
    
    console.log('Migrações compiladas com sucesso');
} catch (error) {
    console.error('Erro ao compilar migrações:', error);
    process.exit(1);
} 