import { DataSource } from 'typeorm';
import { Institution } from '../entities/Institution.js';
import { User } from '../entities/User.js';
import { UserType, Gender } from '../entities/User.js';
import bcrypt from 'bcrypt';

export class Seeder {
    private dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    async seed() {
        try {
            // Criar instituições
            const institutions = await this.createInstitutions();
            
            // Criar usuários
            await this.createUsers(institutions);

            console.log('✅ Seeds executados com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao executar seeds:', error);
            throw error;
        }
    }

    private async createInstitutions(): Promise<Institution[]> {
        const institutionRepository = this.dataSource.getRepository(Institution);

        const institutions = [
            {
                name: 'Escola Municipal São Paulo',
                cnpj: '12345678901234',
                email: 'contato@escolasaopaulo.edu.br',
                phone: '11999999999',
                address: 'Rua das Flores, 123',
                city: 'São Paulo',
                state: 'SP',
                country: 'Brasil',
                postal_code: '01234567',
                active: true
            },
            {
                name: 'Colégio Estadual Rio de Janeiro',
                cnpj: '98765432109876',
                email: 'contato@colegiorj.edu.br',
                phone: '21988888888',
                address: 'Av. Principal, 456',
                city: 'Rio de Janeiro',
                state: 'RJ',
                country: 'Brasil',
                postal_code: '20000000',
                active: true
            }
        ];

        const savedInstitutions = await Promise.all(
            institutions.map(async (institution) => {
                const existingInstitution = await institutionRepository.findOne({
                    where: { email: institution.email }
                });

                if (existingInstitution) {
                    return existingInstitution;
                }

                const newInstitution = institutionRepository.create(institution);
                return await institutionRepository.save(newInstitution);
            })
        );

        return savedInstitutions;
    }

    private async createUsers(institutions: Institution[]): Promise<void> {
        const userRepository = this.dataSource.getRepository(User);

        const users = [
            {
                username: 'joao.silva',
                email: 'joao@exemplo.com',
                password: 'Senha@123',
                full_name: 'João Silva',
                date_of_birth: new Date('1980-01-01'),
                gender: Gender.MASCULINO,
                user_type: UserType.INDEPENDENTE,
                active: true,
                onboarding_completed: true
            },
            {
                username: 'maria.santos',
                email: 'maria@exemplo.com',
                password: 'Senha@123',
                full_name: 'Maria Santos',
                date_of_birth: new Date('2005-05-15'),
                gender: Gender.FEMININO,
                user_type: UserType.INDEPENDENTE,
                active: true,
                onboarding_completed: true
            },
            {
                username: 'escola.sp',
                email: 'admin@escolasaopaulo.edu.br',
                password: 'Senha@123',
                full_name: 'Administrador Escola SP',
                date_of_birth: new Date('1990-01-01'),
                gender: Gender.OUTRO,
                institution_id: institutions[0].id,
                user_type: UserType.INSTITUCIONAL,
                active: true,
                onboarding_completed: true
            },
            {
                username: 'aluno.escola',
                email: 'aluno@escolasaopaulo.edu.br',
                password: 'Senha@123',
                full_name: 'Aluno Escola SP',
                date_of_birth: new Date('2005-01-01'),
                gender: Gender.MASCULINO,
                institution_id: institutions[0].id,
                user_type: UserType.ALUNO,
                active: true,
                onboarding_completed: true
            }
        ];

        await Promise.all(
            users.map(async (user) => {
                const existingUser = await userRepository.findOne({
                    where: { email: user.email }
                });

                if (existingUser) {
                    return;
                }

                const newUser = userRepository.create({
                    ...user,
                    password_hash: await bcrypt.hash(user.password, 10)
                });

                await userRepository.save(newUser);
            })
        );
    }
} 