import type { Request, Response, NextFunction } from 'express';
import { getCustomRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { UnauthorizedError, BadRequestError } from '../errors/index.js';
import { logger } from '../utils/logger.js';
import * as config from '../config/env.js';

interface LoginRequest {
    email: string;
    password: string;
}

interface TokenPayload {
    id: string;
    institution_id: string;
    user_type: string;
}

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    date_of_birth: Date;
    gender: 'M' | 'F' | 'O';
    institution_id: string;
    user_type: 'admin' | 'professional' | 'patient';
}

export class AuthController {
    private userRepository = getCustomRepository(UserRepository);

    /**
     * Autenticação de usuário
     * @route POST /auth/login
     */
    async login(req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;

            // Buscar usuário pelo email
            const user = await this.userRepository.findByEmail(email);
            
            if (!user) {
                throw new UnauthorizedError('Credenciais inválidas');
            }

            // Verificar se o usuário está ativo
            if (!user.active) {
                throw new UnauthorizedError('Usuário inativo');
            }

            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                // Log de tentativa de login inválida
                logger.warn('Tentativa de login inválida', {
                    email,
                    requestId: res.locals.requestId
                });
                
                throw new UnauthorizedError('Credenciais inválidas');
            }

            // Gerar tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Log de login bem-sucedido
            logger.info('Login realizado com sucesso', {
                userId: user.id,
                email: user.email,
                userType: user.user_type,
                requestId: res.locals.requestId
            });

            // Retornar tokens e informações básicas do usuário
            res.json({
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: 'Bearer',
                expires_in: 3600, // 1 hora
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    user_type: user.user_type,
                    institution_id: user.institution_id,
                    onboarding_completed: user.onboarding_completed
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Registro de novo usuário
     * @route POST /auth/register
     */
    async register(req: Request<{}, {}, RegisterRequest>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { password, confirm_password, ...userData } = req.body;

            // Hash da senha
            const passwordHash = await bcrypt.hash(password, 10);

            // Criar usuário usando o repositório
            const user = await this.userRepository.createUser({
                ...userData,
                password_hash: passwordHash,
                active: true,
                onboarding_completed: false,
                settings: {
                    notifications: {
                        email: true,
                        push: true
                    },
                    theme: 'light',
                    language: 'pt-BR'
                }
            });

            // Gerar tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Log de registro
            logger.info('Novo usuário registrado', {
                userId: user.id,
                email: user.email,
                userType: user.user_type,
                institutionId: user.institution_id,
                requestId: res.locals.requestId
            });

            // Retornar tokens e informações do usuário
            res.status(201).json({
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: 'Bearer',
                expires_in: 3600,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    user_type: user.user_type,
                    institution_id: user.institution_id,
                    onboarding_completed: user.onboarding_completed,
                    settings: user.settings
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('já está em uso')) {
                    next(new BadRequestError(error.message));
                } else {
                    next(error);
                }
            } else {
                next(new Error('Erro ao registrar usuário'));
            }
        }
    }

    /**
     * Renovação do token de acesso
     * @route POST /auth/refresh-token
     */
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refresh_token } = req.body;

            // Verificar e decodificar o refresh token
            const decoded = jwt.verify(refresh_token, config.JWT_REFRESH_SECRET) as TokenPayload;

            // Buscar usuário
            const user = await this.userRepository.findOne(decoded.id);
            
            if (!user || !user.active) {
                throw new UnauthorizedError('Token inválido ou usuário inativo');
            }

            // Gerar novos tokens
            const accessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            res.json({
                access_token: accessToken,
                refresh_token: newRefreshToken,
                token_type: 'Bearer',
                expires_in: 3600
            });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new UnauthorizedError('Token inválido'));
            } else {
                next(error);
            }
        }
    }

    /**
     * Solicitação de recuperação de senha
     * @route POST /auth/forgot-password
     */
    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;

            const user = await this.userRepository.findByEmail(email);
            
            if (!user) {
                // Por segurança, não informamos se o email existe ou não
                res.json({ message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação' });
                return;
            }

            // Gerar token de recuperação
            const resetToken = jwt.sign(
                { id: user.id },
                config.JWT_RESET_SECRET,
                { expiresIn: '1h' }
            );

            // TODO: Implementar envio de email com token
            // Por enquanto, apenas logamos o token
            logger.info('Token de recuperação gerado', {
                userId: user.id,
                email: user.email,
                resetToken,
                requestId: res.locals.requestId
            });

            res.json({ message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Redefinição de senha
     * @route POST /auth/reset-password
     */
    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, new_password } = req.body;

            // Verificar e decodificar o token
            const decoded = jwt.verify(token, config.JWT_RESET_SECRET) as { id: string };

            // Buscar usuário
            const user = await this.userRepository.findOne(decoded.id);
            
            if (!user) {
                throw new UnauthorizedError('Token inválido');
            }

            // Hash da nova senha
            const passwordHash = await bcrypt.hash(new_password, 10);

            // Atualizar senha
            user.password_hash = passwordHash;
            await this.userRepository.save(user);

            // Log de alteração de senha
            logger.info('Senha alterada com sucesso', {
                userId: user.id,
                email: user.email,
                requestId: res.locals.requestId
            });

            res.json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new UnauthorizedError('Token inválido ou expirado'));
            } else {
                next(error);
            }
        }
    }

    /**
     * Gera token de acesso JWT
     */
    private generateAccessToken(user: any): string {
        const payload: TokenPayload = {
            id: user.id,
            institution_id: user.institution_id,
            user_type: user.user_type
        };

        return jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRATION
        });
    }

    /**
     * Gera token de refresh JWT
     */
    private generateRefreshToken(user: any): string {
        const payload: TokenPayload = {
            id: user.id,
            institution_id: user.institution_id,
            user_type: user.user_type
        };

        return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            expiresIn: '7d' // 7 dias
        });
    }
} 