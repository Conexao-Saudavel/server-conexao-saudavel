import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // Compila as migrações
    execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });
    
    // Copia as migrações para a pasta dist
    execSync('cp -r src/migrations dist/', { stdio: 'inherit' });
    
    console.log('Migrações compiladas com sucesso');
} catch (error) {
    console.error('Erro ao compilar migrações:', error);
    process.exit(1);
} 