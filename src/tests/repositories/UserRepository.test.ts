import { DataSource } from 'typeorm';
import { User, UserType, Gender } from '../../entities/User.js';
import { UserRepository } from '../../repositories/UserRepository.js';
import { createTestConnection, closeTestConnection, clearTestDatabase } from '../utils/testConnection.js';
import { BadRequestError, NotFoundError } from '../../errors/index.js';
import { AppUsage } from '../../entities/AppUsage.js';
import { DailySummary } from '../../entities/DailySummary.js';
import type { UserFilters } from '../../interfaces/user.interface.js';

describe('UserRepository', () => {
    let dataSource: DataSource;
    let userRepository: UserRepository;

    beforeAll(async () => {
        dataSource = await createTestConnection();
        userRepository = dataSource.getCustomRepository(UserRepository);
    });

    afterAll(async () => {
        await closeTestConnection(dataSource);
    });

    beforeEach(async () => {
        await clearTestDatabase(dataSource);
    });

    describe('createUser', () => {
        it('deve criar um usuário com sucesso', async () => {
            const userData = {
                email: 'teste@exemplo.com',
                username: 'teste',
                password: 'senha123',
                full_name: 'Usuário Teste',
                date_of_birth: new Date('2000-01-01'),
                gender: Gender.MASCULINO,
                institution_id: '123e4567-e89b-12d3-a456-426614174000',
                user_type: UserType.ADOLESCENTE
            };

            const user = await userRepository.createUser(userData);

            expect(user).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(user.username).toBe(userData.username);
            expect(user.password_hash).not.toBe(userData.password);
            expect(user.full_name).toBe(userData.full_name);
            expect(user.date_of_birth).toEqual(userData.date_of_birth);
            expect(user.gender).toBe(userData.gender);
            expect(user.institution_id).toBe(userData.institution_id);
            expect(user.user_type).toBe(userData.user_type);
            expect(user.active).toBe(true);
            expect(user.onboarding_completed).toBe(false);
        });

        it('deve lançar erro ao tentar criar usuário com email duplicado', async () => {
            const userData = {
                email: 'teste@exemplo.com',
                username: 'teste1',
                password: 'senha123',
                full_name: 'Usuário Teste 1',
                date_of_birth: new Date('2000-01-01'),
                gender: Gender.MASCULINO,
                institution_id: '123e4567-e89b-12d3-a456-426614174000',
                user_type: UserType.ADOLESCENTE
            };

            await userRepository.createUser(userData);

            const duplicateUserData = {
                ...userData,
                username: 'teste2',
                full_name: 'Usuário Teste 2'
            };

            await expect(userRepository.createUser(duplicateUserData))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('findByEmail', () => {
        it('deve encontrar usuário por email', async () => {
            const userData = {
                email: 'teste@exemplo.com',
                username: 'teste',
                password: 'senha123',
                full_name: 'Usuário Teste',
                date_of_birth: new Date('2000-01-01'),
                gender: Gender.MASCULINO,
                institution_id: '123e4567-e89b-12d3-a456-426614174000',
                user_type: UserType.ADOLESCENTE
            };

            const createdUser = await userRepository.createUser(userData);
            const foundUser = await userRepository.findByEmail(userData.email);

            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe(createdUser.id);
        });

        it('deve retornar null para email não existente', async () => {
            const foundUser = await userRepository.findByEmail('naoexiste@exemplo.com');
            expect(foundUser).toBeNull();
        });
    });

    describe('findUsers', () => {
        beforeEach(async () => {
            // Criar vários usuários para testar paginação e filtros
            const users = [
                {
                    email: 'adolescente1@exemplo.com',
                    username: 'adolescente1',
                    password: 'senha123',
                    full_name: 'Adolescente 1',
                    date_of_birth: new Date('2008-01-01'),
                    gender: Gender.MASCULINO,
                    institution_id: '123e4567-e89b-12d3-a456-426614174000',
                    user_type: UserType.ADOLESCENTE
                },
                {
                    email: 'adolescente2@exemplo.com',
                    username: 'adolescente2',
                    password: 'senha123',
                    full_name: 'Adolescente 2',
                    date_of_birth: new Date('2009-01-01'),
                    gender: Gender.FEMININO,
                    institution_id: '123e4567-e89b-12d3-a456-426614174000',
                    user_type: UserType.ADOLESCENTE
                },
                {
                    email: 'responsavel@exemplo.com',
                    username: 'responsavel',
                    password: 'senha123',
                    full_name: 'Responsável',
                    date_of_birth: new Date('1980-01-01'),
                    gender: Gender.MASCULINO,
                    institution_id: '123e4567-e89b-12d3-a456-426614174000',
                    user_type: UserType.RESPONSAVEL
                }
            ];

            for (const userData of users) {
                await userRepository.createUser(userData);
            }
        });

        it('deve retornar usuários paginados', async () => {
            const filters: UserFilters = {
                page: 1,
                limit: 2
            };

            const result = await userRepository.findUsers(filters);

            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(3);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(2);
            expect(result.totalPages).toBe(2);
        });

        it('deve filtrar usuários por tipo', async () => {
            const filters: UserFilters = {
                page: 1,
                limit: 10,
                userType: UserType.ADOLESCENTE
            };

            const result = await userRepository.findUsers(filters);

            expect(result.items).toHaveLength(2);
            expect(result.items.every(user => user.user_type === UserType.ADOLESCENTE)).toBe(true);
        });

        it('deve filtrar usuários por status ativo', async () => {
            // Desativar um usuário
            const user = await userRepository.findByEmail('adolescente1@exemplo.com');
            if (user) {
                await userRepository.deactivateUser(user.id);
            }

            const filters: UserFilters = {
                page: 1,
                limit: 10,
                active: true
            };

            const result = await userRepository.findUsers(filters);

            expect(result.items).toHaveLength(2);
            expect(result.items.every(user => user.active)).toBe(true);
        });

        it('deve filtrar usuários por termo de busca', async () => {
            const filters: UserFilters = {
                page: 1,
                limit: 10,
                searchTerm: 'Adolescente'
            };

            const result = await userRepository.findUsers(filters);

            expect(result.items).toHaveLength(2);
            expect(result.items.every(user => user.full_name.includes('Adolescente'))).toBe(true);
        });
    });

    describe('getUserWithUsageStats', () => {
        it('deve retornar estatísticas de uso do usuário', async () => {
            // Criar usuário
            const userData = {
                email: 'teste@exemplo.com',
                username: 'teste',
                password: 'senha123',
                full_name: 'Usuário Teste',
                date_of_birth: new Date('2000-01-01'),
                gender: Gender.MASCULINO,
                institution_id: '123e4567-e89b-12d3-a456-426614174000',
                user_type: UserType.ADOLESCENTE
            };

            const user = await userRepository.createUser(userData);

            // Criar alguns registros de uso de app
            const appUsageRepo = dataSource.getRepository(AppUsage);
            const appUsages = [
                {
                    user,
                    app_name: 'WhatsApp',
                    package_name: 'com.whatsapp',
                    duration: '02:00:00',
                    start_time: new Date('2024-01-01T10:00:00'),
                    end_time: new Date('2024-01-01T12:00:00')
                },
                {
                    user,
                    app_name: 'Instagram',
                    package_name: 'com.instagram',
                    duration: '01:00:00',
                    start_time: new Date('2024-01-01T13:00:00'),
                    end_time: new Date('2024-01-01T14:00:00')
                }
            ];

            await appUsageRepo.save(appUsages);

            // Criar resumo diário
            const dailySummaryRepo = dataSource.getRepository(DailySummary);
            const dailySummary = {
                user,
                date: new Date('2024-01-01'),
                total_screen_time: '03:00:00',
                app_breakdown: [
                    {
                        app_name: 'WhatsApp',
                        duration: '02:00:00',
                        percentage: 66.67
                    },
                    {
                        app_name: 'Instagram',
                        duration: '01:00:00',
                        percentage: 33.33
                    }
                ],
                engagement_metrics: {
                    total_sessions: 2,
                    average_session_duration: '01:30:00',
                    most_used_app: 'WhatsApp',
                    most_used_category: 'Social'
                }
            };

            await dailySummaryRepo.save(dailySummary);

            // Buscar estatísticas
            const stats = await userRepository.getUserWithUsageStats(user.id);

            expect(stats).toBeDefined();
            expect(stats.user.id).toBe(user.id);
            expect(stats.usage_stats.total_screen_time).toBe('03:00:00');
            expect(stats.usage_stats.app_breakdown).toHaveLength(2);
            expect(stats.usage_stats.engagement_metrics.total_sessions).toBe(2);
            expect(stats.usage_stats.engagement_metrics.most_used_app).toBe('WhatsApp');
        });

        it('deve lançar erro para usuário não encontrado', async () => {
            await expect(userRepository.getUserWithUsageStats('id-inexistente'))
                .rejects
                .toThrow(NotFoundError);
        });
    });
}); 