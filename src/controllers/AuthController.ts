import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuthService } from '../services/AuthService.js';
import config from '../config/env.js';

export class AuthController {
    private authService: AuthService;
    private userRepository: UserRepository;

    constructor() {
        this.authService = new AuthService();
        this.userRepository = AppDataSource.getRepository(User) as UserRepository;
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { tokens, user } = await this.authService.authenticate(email, password);
            return res.json({ user, ...tokens });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(401).json({ 
                error: 'Credenciais inválidas' 
            });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { email, password, ...userData } = req.body;

            // Verifica se o email já está em uso
            const existingUser = await this.userRepository.findByEmail(email);

            if (existingUser) {
                return res.status(400).json({ 
                    error: 'Este email já está em uso' 
                });
            }

            // Cria o novo usuário
            const newUser = await this.userRepository.createUser({
                email,
                password_hash: password, // Será hasheada pelo AuthService
                ...userData
            });

            // Autentica o usuário para gerar os tokens
            const { tokens } = await this.authService.authenticate(email, password);

            return res.status(201).json({
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    fullName: newUser.full_name,
                    userType: newUser.user_type
                },
                ...tokens
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar usuário' 
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
        try {
            const { email } = req.body;
            await this.authService.initiatePasswordReset(email);
            return res.json({ 
                message: 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha' 
            });
        } catch (error) {
            console.error('Erro ao solicitar reset de senha:', error);
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