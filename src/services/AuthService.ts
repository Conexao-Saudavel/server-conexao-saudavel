import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/index.js';
import { UnauthorizedError, BadRequestError } from '../errors/index.js';
import { createLogger } from '../utils/logger.js';
import config from '../config/env.js';

const logger = createLogger('auth-service');

// Tipos para os tokens
interface TokenPayload {
    id: string;
    email: string;
    institution_id: string;
    user_type: string;
    iat: number;
    exp: number;
}

interface TokenPair {
    access_token: string;
    refresh_token: string;
}

export class AuthService {
    private userRepository;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    /**
     * Autentica um usuário e retorna os tokens de acesso
     */
    async authenticate(email: string, password: string): Promise<{ tokens: TokenPair; user: Partial<User> }> {
        logger.debug('Iniciando autenticação', { email });

        // Busca o usuário pelo email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            logger.warn('Tentativa de login com email não encontrado', { email });
            throw new UnauthorizedError('Credenciais inválidas');
        }

        // Verifica se o usuário está ativo
        if (!user.active) {
            logger.warn('Tentativa de login com usuário inativo', { 
                userId: user.id,
                email: user.email 
            });
            throw new UnauthorizedError('Usuário inativo');
        }

        // Verifica a senha
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            logger.warn('Tentativa de login com senha inválida', { 
                userId: user.id,
                email: user.email 
            });
            throw new UnauthorizedError('Credenciais inválidas');
        }

        // Gera os tokens
        const tokens = await this.generateTokenPair(user);

        // Log de autenticação bem-sucedida
        logger.info('Usuário autenticado com sucesso', {
            userId: user.id,
            email: user.email,
            userType: user.user_type
        });

        // Retorna os tokens e informações básicas do usuário
        return {
            tokens,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name,
                user_type: user.user_type,
                institution_id: user.institution_id,
                active: user.active,
                onboarding_completed: user.onboarding_completed
            }
        };
    }

    /**
     * Gera um novo par de tokens (access + refresh)
     */
    private async generateTokenPair(user: User): Promise<TokenPair> {
        logger.debug('Gerando tokens para usuário', { 
            userId: user.id,
            email: user.email 
        });

        const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
            id: user.id,
            email: user.email,
            institution_id: user.institution_id || '',
            user_type: user.user_type
        };

        // Gera o token de acesso (1 hora)
        const access_token = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Gera o token de atualização (7 dias)
        const refresh_token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            expiresIn: '7d'
        });

        logger.debug('Tokens gerados com sucesso', { 
            userId: user.id,
            email: user.email 
        });

        return { access_token, refresh_token };
    }

    /**
     * Renova o token de acesso usando o refresh token
     */
    async refreshAccessToken(refresh_token: string): Promise<TokenPair> {
        try {
            // Verifica o refresh token
            const decoded = jwt.verify(refresh_token, config.JWT_REFRESH_SECRET) as TokenPayload;

            // Busca o usuário
            const user = await this.userRepository.findOne({ where: { id: decoded.id } });
            if (!user || !user.active) {
                throw new UnauthorizedError('Usuário não encontrado ou inativo');
            }

            // Gera um novo par de tokens
            return await this.generateTokenPair(user);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token de atualização expirado');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Token de atualização inválido');
            }
            throw error;
        }
    }

    /**
     * Verifica se um token de acesso é válido
     */
    async verifyAccessToken(token: string): Promise<TokenPayload> {
        logger.debug('Verificando token de acesso');

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

            // Verifica se o usuário ainda existe e está ativo
            const user = await this.userRepository.findOne({ where: { id: decoded.id } });
            if (!user || !user.active) {
                logger.warn('Token válido mas usuário não encontrado ou inativo', {
                    userId: decoded.id,
                    email: decoded.email
                });
                throw new UnauthorizedError('Usuário não encontrado ou inativo');
            }

            logger.debug('Token verificado com sucesso', {
                userId: decoded.id,
                email: decoded.email
            });

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                logger.warn('Token expirado');
                throw new UnauthorizedError('Token expirado');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                logger.warn('Token inválido', {
                    error: error.message
                });
                throw new UnauthorizedError('Token inválido');
            }
            throw error;
        }
    }

    /**
     * Inicia o processo de recuperação de senha
     */
    async initiatePasswordReset(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            // Por segurança, não revelamos se o email existe ou não
            logger.info('Tentativa de recuperação de senha para email não cadastrado', { email });
            return;
        }

        // Gera um token de reset (1 hora)
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            config.JWT_RESET_SECRET,
            { expiresIn: '1h' }
        );

        // TODO: Implementar envio de email com o token
        logger.info('Token de recuperação de senha gerado', {
            userId: user.id,
            email: user.email
        });

        // Por enquanto, apenas logamos o token em desenvolvimento
        if (config.NODE_ENV === 'development') {
            logger.debug('Token de reset (apenas em desenvolvimento)', { resetToken });
        }
    }

    /**
     * Redefine a senha do usuário usando o token de reset
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            // Verifica o token
            const decoded = jwt.verify(token, config.JWT_RESET_SECRET) as { id: string; email: string };

            // Busca o usuário
            const user = await this.userRepository.findOne({ where: { id: decoded.id } });
            if (!user || user.email !== decoded.email) {
                throw new BadRequestError('Token inválido');
            }

            // Hash da nova senha
            const password_hash = await bcrypt.hash(newPassword, 10);

            // Atualiza a senha
            await this.userRepository.update(user.id, { password_hash });

            logger.info('Senha redefinida com sucesso', {
                userId: user.id,
                email: user.email
            });
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token de recuperação expirado');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Token de recuperação inválido');
            }
            throw error;
        }
    }
} 