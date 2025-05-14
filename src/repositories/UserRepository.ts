import { EntityRepository, Repository } from 'typeorm';
import type { FindOneOptions } from 'typeorm';
import { User } from '../entities/index.js';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    /**
     * Busca um usuário pelo email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }

    /**
     * Busca um usuário pelo username
     */
    async findByUsername(username: string): Promise<User | null> {
        return this.findOne({ where: { username } });
    }

    /**
     * Busca usuários ativos por instituição
     */
    async findActiveByInstitution(institutionId: string): Promise<User[]> {
        return this.find({
            where: {
                institution_id: institutionId,
                active: true
            }
        });
    }

    /**
     * Busca usuários por tipo
     */
    async findByType(userType: string): Promise<User[]> {
        return this.find({
            where: {
                user_type: userType,
                active: true
            }
        });
    }

    /**
     * Busca usuário com relacionamentos
     */
    async findWithRelations(id: string): Promise<User | null> {
        return this.findOne({
            where: { id },
            relations: ['institution', 'devices', 'user_settings']
        });
    }

    /**
     * Verifica se um email já está em uso
     */
    async isEmailInUse(email: string): Promise<boolean> {
        const count = await this.count({ where: { email } });
        return count > 0;
    }

    /**
     * Verifica se um username já está em uso
     */
    async isUsernameInUse(username: string): Promise<boolean> {
        const count = await this.count({ where: { username } });
        return count > 0;
    }

    /**
     * Cria um novo usuário com validações adicionais
     */
    async createUser(userData: Partial<User>): Promise<User> {
        // Verificar email duplicado
        if (await this.isEmailInUse(userData.email!)) {
            throw new Error('Email já está em uso');
        }

        // Verificar username duplicado
        if (await this.isUsernameInUse(userData.username!)) {
            throw new Error('Username já está em uso');
        }

        // Criar usuário
        const user = this.create(userData);
        return this.save(user);
    }

    /**
     * Atualiza um usuário com validações adicionais
     */
    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        const options: FindOneOptions<User> = { where: { id } };
        const user = await this.findOne(options);
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Se estiver atualizando o email, verificar duplicidade
        if (userData.email && userData.email !== user.email) {
            if (await this.isEmailInUse(userData.email)) {
                throw new Error('Email já está em uso');
            }
        }

        // Se estiver atualizando o username, verificar duplicidade
        if (userData.username && userData.username !== user.username) {
            if (await this.isUsernameInUse(userData.username)) {
                throw new Error('Username já está em uso');
            }
        }

        // Atualizar usuário
        Object.assign(user, userData);
        return this.save(user);
    }

    /**
     * Desativa um usuário
     */
    async deactivateUser(id: string): Promise<User> {
        const options: FindOneOptions<User> = { where: { id } };
        const user = await this.findOne(options);
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        user.active = false;
        return this.save(user);
    }

    /**
     * Reativa um usuário
     */
    async reactivateUser(id: string): Promise<User> {
        const options: FindOneOptions<User> = { where: { id } };
        const user = await this.findOne(options);
        
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        user.active = true;
        return this.save(user);
    }
} 