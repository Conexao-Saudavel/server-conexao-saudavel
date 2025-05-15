import { EntityRepository, Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like, ILike } from 'typeorm';
import type { FindOneOptions } from 'typeorm';
import { User, UserType, Gender } from '../entities/User.js';
import { AppDataSource } from '../data-source.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { logger } from '../utils/logger.js';
import { CacheService } from '../services/CacheService.js';
import type { 
    PaginationOptions, 
    PaginatedResult, 
    UserWithStats, 
    UserFilters,
    UsageStats,
    AppBreakdown
} from '../interfaces/user.interface.js';
import bcrypt from 'bcrypt';
import { AppUsage } from '../entities/AppUsage.js';
import { DailySummary } from '../entities/DailySummary.js';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    private cacheService: CacheService;

    constructor(connection: any) {
        super(User, connection);
        this.cacheService = new CacheService('user:');
    }

    /**
     * Busca um usuário pelo email com cache
     */
    async findByEmail(email: string): Promise<User | null> {
        const cacheKey = `user:email:${email}`;
        
        return this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.findOne({
                where: { email },
                relations: ['institution', 'devices', 'user_settings']
            });
            return user || null;
        }, 300); // Cache por 5 minutos
    }

    /**
     * Busca um usuário pelo username
     */
    async findByUsername(username: string): Promise<User | null> {
        return this.findOne({ where: { username } });
    }

    /**
     * Busca usuários com paginação e filtros
     */
    async findUsers(filters: UserFilters): Promise<PaginatedResult<User>> {
        const { page = 1, limit = 10, active, userType, institutionId, searchTerm, gender, minAge, maxAge } = filters;
        const skip = (page - 1) * limit;

        const queryBuilder = this.createQueryBuilder('user')
            .leftJoinAndSelect('user.institution', 'institution')
            .leftJoinAndSelect('user.user_settings', 'settings');

        // Aplicar filtros
        if (active !== undefined) {
            queryBuilder.andWhere('user.active = :active', { active });
        }

        if (userType) {
            queryBuilder.andWhere('user.user_type = :userType', { userType });
        }

        if (institutionId) {
            queryBuilder.andWhere('user.institution_id = :institutionId', { institutionId });
        }

        if (gender) {
            queryBuilder.andWhere('user.gender = :gender', { gender });
        }

        if (searchTerm) {
            queryBuilder.andWhere(
                '(user.full_name ILIKE :searchTerm OR user.email ILIKE :searchTerm OR user.username ILIKE :searchTerm)',
                { searchTerm: `%${searchTerm}%` }
            );
        }

        if (minAge || maxAge) {
            const now = new Date();
            const minDate = minAge ? new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate()) : undefined;
            const maxDate = maxAge ? new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate() + 1) : undefined;

            if (minDate && maxDate) {
                queryBuilder.andWhere('user.date_of_birth BETWEEN :maxDate AND :minDate', { minDate, maxDate });
            } else if (minDate) {
                queryBuilder.andWhere('user.date_of_birth <= :minDate', { minDate });
            } else if (maxDate) {
                queryBuilder.andWhere('user.date_of_birth >= :maxDate', { maxDate });
            }
        }

        // Contar total de registros
        const total = await queryBuilder.getCount();

        // Buscar registros paginados
        const items = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('user.created_at', 'DESC')
            .getMany();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Busca usuários ativos por instituição com paginação
     */
    async findActiveUsersByInstitution(institutionId: string, page = 1, limit = 10): Promise<PaginatedResult<User>> {
        return this.findUsers({
            institutionId,
            active: true,
            page,
            limit
        });
    }

    /**
     * Busca usuários por tipo
     */
    async findUsersByType(userType: UserType, page = 1, limit = 10): Promise<PaginatedResult<User>> {
        return this.findUsers({
            userType,
            page,
            limit
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
     * Busca estatísticas de uso de um usuário com cache
     */
    async getUserWithUsageStats(userId: string): Promise<UserWithStats> {
        const cacheKey = `user:stats:${userId}`;
        
        return this.cacheService.getOrSet(cacheKey, async () => {
            const user = await this.findOne({
                where: { id: userId },
                relations: ['app_usages', 'daily_summaries']
            });

            if (!user) {
                throw new NotFoundError('Usuário não encontrado');
            }

            // Calcular estatísticas de uso
            const usageStats = await this.calculateUsageStats(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    full_name: user.full_name,
                    user_type: user.user_type,
                    institution_id: user.institution_id,
                    active: user.active,
                    onboarding_completed: user.onboarding_completed,
                    settings: user.settings
                },
                usage_stats: usageStats
            };
        }, 300); // Cache por 5 minutos
    }

    private async calculateUsageStats(user: User): Promise<UsageStats> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appUsages = await this.manager
            .createQueryBuilder(AppUsage, 'usage')
            .where('usage.user_id = :userId', { userId: user.id })
            .andWhere('usage.start_time >= :today', { today })
            .getMany();

        const dailySummary = await this.manager
            .createQueryBuilder(DailySummary, 'summary')
            .where('summary.user_id = :userId', { userId: user.id })
            .andWhere('summary.date = :today', { today })
            .getOne();

        if (dailySummary) {
            return {
                total_screen_time: dailySummary.total_screen_time,
                app_breakdown: dailySummary.app_breakdown,
                engagement_metrics: dailySummary.engagement_metrics
            };
        }

        // Se não houver resumo diário, calcular com base nos usos de app
        const totalDuration = appUsages.reduce((total, usage) => {
            const duration = new Date(usage.end_time).getTime() - new Date(usage.start_time).getTime();
            return total + duration;
        }, 0);

        const appBreakdown: AppBreakdown[] = appUsages.reduce((breakdown: AppBreakdown[], usage) => {
            const duration = new Date(usage.end_time).getTime() - new Date(usage.start_time).getTime();
            const existingApp = breakdown.find(app => app.app_name === usage.app_name);

            if (existingApp) {
                existingApp.duration = this.formatDuration(
                    this.parseDuration(existingApp.duration) + duration
                );
                existingApp.percentage = (this.parseDuration(existingApp.duration) / totalDuration) * 100;
            } else {
                breakdown.push({
                    app_name: usage.app_name,
                    duration: this.formatDuration(duration),
                    percentage: (duration / totalDuration) * 100
                });
            }

            return breakdown;
        }, []);

        const mostUsedApp = appBreakdown.reduce((max: AppBreakdown, app: AppBreakdown) => 
            this.parseDuration(app.duration) > this.parseDuration(max.duration) ? app : max
        , appBreakdown[0]);

        return {
            total_screen_time: this.formatDuration(totalDuration),
            app_breakdown: appBreakdown,
            engagement_metrics: {
                total_sessions: appUsages.length,
                average_session_duration: this.formatDuration(totalDuration / appUsages.length),
                most_used_app: mostUsedApp?.app_name || 'N/A',
                most_used_category: 'Social' // TODO: Implementar categorização de apps
            }
        };
    }

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    private parseDuration(duration: string): number {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    /**
     * Cria um novo usuário com validações
     */
    async createUser(userData: {
        email: string;
        username: string;
        password: string;
        full_name: string;
        date_of_birth: Date;
        gender: Gender;
        institution_id: string;
        user_type: UserType;
        settings?: Record<string, any>;
    }): Promise<User> {
        // Verificar se email já existe
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestError('Email já cadastrado');
        }

        // Verificar se username já existe
        const existingUsername = await this.findOne({ where: { username: userData.username } });
        if (existingUsername) {
            throw new BadRequestError('Nome de usuário já cadastrado');
        }

        // Criar usuário
        const user = this.create({
            ...userData,
            password_hash: await bcrypt.hash(userData.password, 10),
            active: true,
            onboarding_completed: false,
            settings: userData.settings || {}
        });

        // Salvar usuário
        const savedUser = await this.save(user);

        // Invalidar cache
        await this.cacheService.invalidatePattern('user:*');

        return savedUser;
    }

    /**
     * Atualiza um usuário com validações
     */
    async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
        const user = await this.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        // Verificar email duplicado
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.findByEmail(updateData.email);
            if (existingUser) {
                throw new BadRequestError('Email já cadastrado');
            }
        }

        // Verificar username duplicado
        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await this.findOne({ where: { username: updateData.username } });
            if (existingUsername) {
                throw new BadRequestError('Nome de usuário já cadastrado');
            }
        }

        // Atualizar usuário
        Object.assign(user, updateData);
        const updatedUser = await this.save(user);

        // Invalidar cache
        await this.cacheService.invalidatePattern('user:*');

        return updatedUser;
    }

    /**
     * Desativa um usuário
     */
    async deactivateUser(userId: string): Promise<void> {
        const user = await this.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('Usuário não encontrado');
        }

        user.active = false;
        await this.save(user);

        // Invalidar cache
        await this.cacheService.invalidatePattern('user:*');
    }

    /**
     * Busca usuários que completaram o onboarding
     */
    async findUsersWithCompletedOnboarding(): Promise<User[]> {
        return this.find({
            where: {
                onboarding_completed: true,
                active: true
            },
            relations: ['institution', 'user_settings'],
            order: {
                updated_at: 'DESC'
            }
        });
    }

    /**
     * Busca usuários por faixa etária
     */
    async findUsersByAgeRange(minAge: number, maxAge: number, page = 1, limit = 10): Promise<PaginatedResult<User>> {
        return this.findUsers({
            minAge,
            maxAge,
            page,
            limit
        });
    }
} 