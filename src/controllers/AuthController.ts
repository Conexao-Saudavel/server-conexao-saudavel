import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuthService } from '../services/AuthService.js';
import config from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-controller');

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = new UserRepository();
    }

    async login(req: Request, res: Response) {
        const { email } = req.body;
        logger.info('Tentativa de login', { email });

        try {
            const { email, password } = req.body;
            const { tokens, user } = await this.authService.authenticate(email, password);
            
            logger.info('Login realizado com sucesso', {
                userId: user.id,
                email: user.email,
                userType: user.user_type
            });

            return res.json({ user, ...tokens });
        } catch (error) {
            logger.error('Falha no login', {
                email,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined
            });

            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }
    }

    async register(req: Request, res: Response) {
        const { email, username } = req.body;
        logger.info('Tentativa de registro', { email, username });

        try {
            const { email, password, ...userData } = req.body;

            // Verifica se o email já está em uso
            const existingUser = await this.userRepository.findByEmail(email);

            if (existingUser) {
                logger.warn('Tentativa de registro com email já existente', { email });
                return res.status(400).json({ 
                    error: 'Este email já está em uso' 
                });
            }

            // Cria o novo usuário
            const newUser = await this.userRepository.createUser({
                email,
                username: userData.username,
                password: password,
                full_name: userData.full_name,
                date_of_birth: new Date(userData.date_of_birth),
                gender: userData.gender,
                institution_id: userData.institution_id,
                user_type: userData.user_type,
                settings: userData.settings || {}
            });

            logger.info('Usuário registrado com sucesso', {
                userId: newUser.id,
                email: newUser.email,
                userType: newUser.user_type
            });

            // Autentica o usuário para gerar os tokens
            const { tokens } = await this.authService.authenticate(email, password);

            return res.status(201).json({
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    user_type: newUser.user_type
                },
                ...tokens
            });
        } catch (error) {
            logger.error('Falha no registro', {
                email,
                username,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined
            });

            return res.status(500).json({ 
                error: 'Erro ao criar usuário',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;
            const tokens = await this.authService.refreshAccessToken(refresh_token);
            return res.json(tokens);
        } catch (error) {
            console.error('Erro ao atualizar token:', error);
            return res.status(401).json({ 
                error: 'Token de atualização inválido' 
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        logger.info('Solicitação de recuperação de senha', { email });

        try {
            await this.authService.initiatePasswordReset(email);
            
            logger.info('Email de recuperação enviado', { email });
            
            return res.json({ 
                message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha' 
            });
        } catch (error) {
            logger.error('Falha ao processar recuperação de senha', {
                email,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
                stack: error instanceof Error ? error.stack : undefined
            });

            return res.status(500).json({ 
                error: 'Erro ao processar solicitação de reset de senha' 
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, new_password } = req.body;
            await this.authService.resetPassword(token, new_password);
            return res.json({ 
                message: 'Senha atualizada com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao resetar senha:', error);
            return res.status(400).json({ 
                error: 'Token inválido ou expirado' 
            });
        }
    }
} 