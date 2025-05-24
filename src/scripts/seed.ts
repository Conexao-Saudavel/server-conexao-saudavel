import { DataSource } from 'typeorm';
import config from '../config/env.js';
import { User, Institution, Role, Permission } from '../entities/index.js';
import { hash } from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: config.DATABASE_URL,
    ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [User, Institution, Role, Permission],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida');

    // Criar permissões
    const permissions = [
      { name: 'user:create', description: 'Criar usuários' },
      { name: 'user:read', description: 'Ler usuários' },
      { name: 'user:update', description: 'Atualizar usuários' },
      { name: 'user:delete', description: 'Deletar usuários' },
      { name: 'institution:create', description: 'Criar instituições' },
      { name: 'institution:read', description: 'Ler instituições' },
      { name: 'institution:update', description: 'Atualizar instituições' },
      { name: 'institution:delete', description: 'Deletar instituições' },
    ];

    const permissionRepository = dataSource.getRepository(Permission);
    for (const permission of permissions) {
      const existingPermission = await permissionRepository.findOne({ where: { name: permission.name } });
      if (!existingPermission) {
        await permissionRepository.save(permission);
      }
    }

    // Criar roles
    const roles = [
      { name: 'admin', description: 'Administrador do sistema' },
      { name: 'institution_admin', description: 'Administrador de instituição' },
      { name: 'user', description: 'Usuário comum' },
    ];

    const roleRepository = dataSource.getRepository(Role);
    for (const role of roles) {
      const existingRole = await roleRepository.findOne({ where: { name: role.name } });
      if (!existingRole) {
        await roleRepository.save(role);
      }
    }

    // Criar instituição padrão
    const institutionRepository = dataSource.getRepository(Institution);
    const defaultInstitution = await institutionRepository.findOne({ where: { name: 'Instituição Padrão' } });
    if (!defaultInstitution) {
      await institutionRepository.save({
        name: 'Instituição Padrão',
        description: 'Instituição padrão do sistema',
        status: 'active',
      });
    }

    // Criar usuário admin
    const userRepository = dataSource.getRepository(User);
    const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    const adminUser = await userRepository.findOne({ where: { email: 'admin@conexaosaudavel.com' } });

    if (!adminUser && adminRole) {
      const hashedPassword = await hash('admin123', 10);
      await userRepository.save({
        name: 'Administrador',
        email: 'admin@conexaosaudavel.com',
        password: hashedPassword,
        role: adminRole,
        status: 'active',
      });
    }

    console.log('Seed concluído com sucesso');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error); 