
# Estrutura de Dados do Servidor Principal - Conexão Saudável

**Versão:** 1.0  
**Data:** 2025-05-13  
**Status:** #finalizado  
**Tags:** [[Conexão Saudável - Backend]], [[Conexão Saudável - API]], [[Conexão Saudável - Banco de Dados v2.0]]

## Sumário

1. [Introdução](#1-introdu%C3%A7%C3%A3o)
2. [Arquitetura de Dados do Servidor](#2-arquitetura-de-dados-do-servidor)
    - 2.1. [Referência ao Esquema PostgreSQL](#21-refer%C3%AAncia-ao-esquema-postgresql)
    - 2.2. [Camada de Acesso a Dados (TypeORM)](#22-camada-de-acesso-a-dados-typeorm)
        - 2.2.1. [Entidades/Models](#221-entidadesmodels)
        - 2.2.2. [Repositórios/DAOs](#222-reposit%C3%B3riosdaos)
    - 2.3. [Data Transfer Objects (DTOs)](#23-data-transfer-objects-dtos)
3. [API RESTful (Express.js)](#3-api-restful-expressjs)
    - 3.1. [Estrutura de Rotas](#31-estrutura-de-rotas)
    - 3.2. [Endpoints Principais (Exemplos)](#32-endpoints-principais-exemplos)
4. [Serviços e Lógica de Negócio](#4-servi%C3%A7os-e-l%C3%B3gica-de-neg%C3%B3cio)
    - 4.1. [Estrutura dos Serviços](#41-estrutura-dos-servi%C3%A7os)
    - 4.2. [Exemplos de Serviços (TypeScript)](#42-exemplos-de-servi%C3%A7os-typescript)
5. [Middleware (Express.js)](#5-middleware-expressjs)
    - 5.1. [Middleware de Autenticação](#51-middleware-de-autentica%C3%A7%C3%A3o)
    - 5.2. [Middleware de Validação](#52-middleware-de-valida%C3%A7%C3%A3o)
    - 5.3. [Middleware de Tratamento de Erros](#53-middleware-de-tratamento-de-erros)
    - 5.4. [Middleware de Logging](#54-middleware-de-logging)
6. [Configuração e Variáveis de Ambiente](#6-configura%C3%A7%C3%A3o-e-vari%C3%A1veis-de-ambiente)
7. [Segurança Avançada](#7-seguran%C3%A7a-avan%C3%A7ada)
    - 7.1. [Validação de Entrada](#71-valida%C3%A7%C3%A3o-de-entrada)
    - 7.2. [Prevenção contra Ataques Comuns](#72-preven%C3%A7%C3%A3o-contra-ataques-comuns)
    - 7.3. [Rate Limiting e Throttling](#73-rate-limiting-e-throttling)
8. [Estratégias de Cache (Servidor)](#8-estrat%C3%A9gias-de-cache-servidor)
    - 8.1. [Cache de Respostas da API](#81-cache-de-respostas-da-api)
    - 8.2. [Cache de Dados Agregados/Processados](#82-cache-de-dados-agregadosprocessados)
9. [Tratamento de Erros Global](#9-tratamento-de-erros-global)
    - 9.1. [Classes de Erro Customizadas](#91-classes-de-erro-customizadas)
    - 9.2. [Estrutura de Resposta de Erro da API](#92-estrutura-de-resposta-de-erro-da-api)
10. [Logging e Monitoramento (Servidor)](#10-logging-e-monitoramento-servidor)
    - 10.1. [Formato dos Logs](#101-formato-dos-logs)
    - 10.2. [Métricas Chave do Servidor](#102-m%C3%A9tricas-chave-do-servidor)
11. [Tarefas em Background / Filas](#11-tarefas-em-background--filas)
12. [Estratégia de Testes](#12-estrat%C3%A9gia-de-testes)

## 1. Introdução

Este documento descreve a estrutura lógica e de dados do servidor principal da aplicação Conexão Saudável. Ele abrange a definição das entidades do banco de dados (como são representadas na aplicação), a arquitetura da API RESTful, os serviços de negócio, middlewares e outras considerações cruciais para o backend. A stack tecnológica principal é Node.js com Express.js, TypeScript e PostgreSQL.

Este documento complementa e se baseia no esquema de banco de dados detalhado em "Conexão Saudável - Banco de Dados v2.0.md".

## 2. Arquitetura de Dados do Servidor

### 2.1. Referência ao Esquema PostgreSQL

O diagrama ER da aplicação contempla 11 entidades principais que compõem a base de dados:

- **INSTITUTIONS**: Organizações que gerenciam usuários
- **USERS**: Usuários do sistema (adolescentes, pacientes, membros de organização)
- **DEVICES**: Dispositivos dos usuários
- **APP_USAGE**: Dados de uso de aplicativos
- **DAILY_SUMMARIES**: Resumos diários de uso
- **WEEKLY_REPORTS**: Relatórios semanais
- **USER_SETTINGS**: Configurações por usuário
- **QUESTIONNAIRES**: Questionários disponíveis
- **QUESTIONNAIRE_RESPONSES**: Respostas aos questionários
- **ACHIEVEMENTS**: Conquistas dos usuários
- **SYNC_LOGS**: Registros de sincronização
- **INSTITUTION_ANALYTICS**: Análises por instituição

A relação completa com cardinalidades e atributos está documentada no diagrama ER do sistema.

### 2.2. Camada de Acesso a Dados (TypeORM)

#### 2.2.1. Entidades/Models

As entidades TypeORM são representações diretas das tabelas do banco de dados:

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Institution } from "./Institution";
import { Device } from "./Device";
import { AppUsage } from "./AppUsage";
import { DailySummary } from "./DailySummary";
import { UserSettings } from "./UserSettings";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password_hash: string;

    @Column()
    full_name: string;

    @Column({ type: "date" })
    date_of_birth: Date;

    @Column()
    gender: string;

    @Column()
    institution_id: string;

    @Column()
    user_type: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: false })
    onboarding_completed: boolean;

    @Column({ type: "jsonb", nullable: true })
    settings: any;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relacionamentos
    @ManyToOne(() => Institution, institution => institution.users)
    @JoinColumn({ name: "institution_id" })
    institution: Institution;

    @OneToMany(() => Device, device => device.user)
    devices: Device[];

    @OneToMany(() => AppUsage, appUsage => appUsage.user)
    app_usages: AppUsage[];

    @OneToMany(() => DailySummary, dailySummary => dailySummary.user)
    daily_summaries: DailySummary[];

    @OneToMany(() => Achievement, achievement => achievement.user)
    achievements: Achievement[];
}
```

**Demais entidades seguem o mesmo padrão de implementação.**

#### 2.2.2. Repositórios/DAOs

Os repositórios estendem o `Repository` do TypeORM, adicionando métodos customizados:

```typescript
// src/repositories/UserRepository.ts
import { EntityRepository, Repository } from "typeorm";
import { User } from "../entities/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ where: { email } });
    }

    findActiveUsersByInstitution(institutionId: string): Promise<User[]> {
        return this.find({
            where: {
                institution_id: institutionId,
                active: true
            }
        });
    }
    
    async getUserWithUsageStats(userId: string): Promise<any> {
        const user = await this.findOne(userId);
        
        // Query customizada para estatísticas
        const stats = await this.createQueryBuilder("user")
            .leftJoinAndSelect("user.daily_summaries", "summary")
            .where("user.id = :userId", { userId })
            .andWhere("summary.date >= :startDate", { 
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            })
            .getOne();
            
        return {
            user,
            stats: stats ? stats.daily_summaries : []
        };
    }
}
```

### 2.3. Data Transfer Objects (DTOs)

DTOs padronizam a entrada e saída de dados da API:

```typescript
// src/dtos/user.dto.ts
export class CreateUserDto {
    username: string;
    email: string;
    password: string;
    full_name: string;
    date_of_birth: Date;
    gender: string;
    institution_id: string;
    user_type: string;
}

export class UpdateUserDto {
    full_name?: string;
    gender?: string;
    active?: boolean;
    onboarding_completed?: boolean;
    settings?: any;
}

export class UserResponseDto {
    id: string;
    username: string;
    email: string;
    full_name: string;
    date_of_birth: Date;
    gender: string;
    institution_id: string;
    user_type: string;
    active: boolean;
    onboarding_completed: boolean;
    settings: any;
    created_at: Date;
    updated_at: Date;
}
```

## 3. API RESTful (Express.js)

### 3.1. Estrutura de Rotas

```typescript
// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import institutionRoutes from "./institution.routes";
import deviceRoutes from "./device.routes";
import appUsageRoutes from "./appUsage.routes";
import syncRoutes from "./sync.routes";
import reportRoutes from "./report.routes";
import questionnaireRoutes from "./questionnaire.routes";
import achievementRoutes from "./achievement.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

// Rotas públicas
router.use("/auth", authRoutes);

// Middleware de autenticação aplicado a partir daqui
router.use("/users", userRoutes);
router.use("/institutions", institutionRoutes);
router.use("/devices", deviceRoutes);
router.use("/app-usage", appUsageRoutes);
router.use("/sync", syncRoutes);
router.use("/reports", reportRoutes);
router.use("/questionnaires", questionnaireRoutes);
router.use("/achievements", achievementRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
```

### 3.2. Endpoints Principais (Exemplos)

```typescript
// src/routes/sync.routes.ts
import { Router } from "express";
import { SyncController } from "../controllers/SyncController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateInput } from "../middlewares/validation.middleware";
import { syncEventsSchema } from "../validations/sync.validation";

const router = Router();
const syncController = new SyncController();

// Middleware de autenticação aplicado a todas as rotas
router.use(authMiddleware);

/**
 * @route POST /sync/events
 * @desc Sincroniza eventos de uso de aplicativos
 * @access Private
 */
router.post(
    "/events",
    validateInput(syncEventsSchema),
    syncController.syncEvents
);

/**
 * @route GET /sync/status
 * @desc Retorna status da última sincronização
 * @access Private
 */
router.get("/status/:deviceId", syncController.getLastSyncStatus);

export default router;
```

## 4. Serviços e Lógica de Negócio

### 4.1. Estrutura dos Serviços

Os serviços implementam a lógica de negócio e são invocados pelos controllers:

```typescript
// src/services/index.ts
export { AuthService } from "./AuthService";
export { UserService } from "./UserService";
export { DeviceService } from "./DeviceService";
export { InstitutionService } from "./InstitutionService";
export { AppUsageService } from "./AppUsageService";
export { SyncService } from "./SyncService";
export { ReportService } from "./ReportService";
export { QuestionnaireService } from "./QuestionnaireService";
export { AchievementService } from "./AchievementService";
export { AnalyticsService } from "./AnalyticsService";
```

### 4.2. Exemplos de Serviços (TypeScript)

#### SyncService

```typescript
// src/services/SyncService.ts
import { getCustomRepository } from "typeorm";
import { AppUsageRepository, DeviceRepository, SyncLogRepository } from "../repositories";
import { AppUsage, SyncLog, Device } from "../entities";
import { BadRequestError } from "../errors";
import { validateSyncHash } from "../utils/security";

interface SyncEventsPayload {
    deviceId: string;
    userId: string;
    clientVersion: string;
    events: Array<{
        id: string;
        package_name: string;
        app_name: string;
        start_time: Date;
        end_time: Date;
        foreground: boolean;
        category: string;
        metadata?: any;
    }>;
    hash: string; // Para validação de integridade
}

export class SyncService {
    private appUsageRepository = getCustomRepository(AppUsageRepository);
    private deviceRepository = getCustomRepository(DeviceRepository);
    private syncLogRepository = getCustomRepository(SyncLogRepository);

    async syncEvents(payload: SyncEventsPayload, secretKey: string): Promise<{
        success: boolean;
        processed_ids: string[];
        updated_settings?: any;
    }> {
        // Validar hash para segurança
        const isValid = validateSyncHash(payload, secretKey);
        if (!isValid) {
            throw new BadRequestError("Invalid sync data integrity hash");
        }

        // Registrar início da sincronização
        const syncLog = this.syncLogRepository.create({
            user_id: payload.userId,
            device_id: payload.deviceId,
            started_at: new Date(),
            status: "processing",
            records_received: payload.events.length,
            client_version: payload.clientVersion,
            connection_details: {
                ip: "captured-separately",
                user_agent: "captured-separately"
            }
        });
        await this.syncLogRepository.save(syncLog);

        try {
            // Processar cada evento de uso de app
            const processedIds = [];
            for (const event of payload.events) {
                const appUsage = this.appUsageRepository.create({
                    id: event.id, // Usando ID gerado no cliente
                    user_id: payload.userId,
                    device_id: payload.deviceId,
                    package_name: event.package_name,
                    app_name: event.app_name,
                    start_time: event.start_time,
                    end_time: event.end_time,
                    duration_seconds: 
                        (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 1000,
                    category: event.category,
                    foreground: event.foreground,
                    metadata: event.metadata || {},
                    client_created_at: new Date()
                });
                await this.appUsageRepository.save(appUsage);
                processedIds.push(event.id);
            }

            // Atualizar informações do dispositivo
            await this.deviceRepository.update(
                { id: payload.deviceId }, 
                { last_sync_at: new Date() }
            );

            // Buscar configurações atualizadas para retornar ao cliente
            const device = await this.deviceRepository.findOne(payload.deviceId, {
                relations: ["user", "user.user_settings"]
            });
            
            // Completar o log de sync
            syncLog.completed_at = new Date();
            syncLog.status = "completed";
            syncLog.records_sent = 1; // Para as configurações
            await this.syncLogRepository.save(syncLog);

            return {
                success: true,
                processed_ids: processedIds,
                updated_settings: device?.user?.user_settings || {}
            };
        } catch (error) {
            // Registro de falha
            syncLog.status = "failed";
            syncLog.error_details = JSON.stringify(error);
            await this.syncLogRepository.save(syncLog);
            
            throw error;
        }
    }

    async getLastSyncStatus(deviceId: string): Promise<SyncLog | null> {
        return this.syncLogRepository.findOne({
            where: { device_id: deviceId },
            order: { started_at: "DESC" }
        });
    }
}
```

## 5. Middleware (Express.js)

### 5.1. Middleware de Autenticação

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repositories";

interface TokenPayload {
    id: string;
    institution_id: string;
    user_type: string;
    iat: number;
    exp: number;
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedError("Token not provided");
    }

    // Format: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
        throw new UnauthorizedError("Token error");
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        throw new UnauthorizedError("Token malformatted");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        
        // Verificar se o usuário existe e está ativo
        const userRepository = getCustomRepository(UserRepository);
        const user = await userRepository.findOne(decoded.id);
        
        if (!user || !user.active) {
            throw new UnauthorizedError("Invalid or inactive user");
        }

        // Adicionar informações do usuário ao request
        req.user = {
            id: decoded.id,
            institution_id: decoded.institution_id,
            user_type: decoded.user_type
        };

        return next();
    } catch (err) {
        throw new UnauthorizedError("Invalid token");
    }
}
```

### 5.2. Middleware de Validação

Utilizando Joi para validação de esquemas:

```typescript
// src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { BadRequestError } from "../errors";

export function validateInput(schema: Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errorDetails = error.details.map(detail => ({
                message: detail.message,
                path: detail.path
            }));
            
            throw new BadRequestError("Validation error", errorDetails);
        }
        
        next();
    };
}
```

### 5.3. Middleware de Tratamento de Erros

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { BaseError, InternalServerError } from "../errors";
import { logger } from "../utils/logger";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): Response {
    // Se for um erro conhecido (estendendo BaseError)
    if (error instanceof BaseError) {
        if (error.statusCode >= 500) {
            logger.error(`[${error.name}] ${error.message}`, {
                stack: error.stack,
                details: error.details
            });
        } else {
            logger.warn(`[${error.name}] ${error.message}`, {
                details: error.details
            });
        }

        return res.status(error.statusCode).json({
            error: error.name,
            message: error.message,
            details: error.details
        });
    }

    // Para erros não tratados
    logger.error(`[UnhandledError] ${error.message}`, {
        stack: error.stack
    });

    const internalError = new InternalServerError("An unexpected error occurred");
    
    return res.status(internalError.statusCode).json({
        error: internalError.name,
        message: internalError.message
    });
}
```

### 5.4. Middleware de Logging

```typescript
// src/middlewares/logging.middleware.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

export function requestLogger(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Gerar ID único para a requisição
    const requestId = uuidv4();
    res.locals.requestId = requestId;
    
    // Adicionar ao contexto da requisição
    req.requestId = requestId;
    
    // Timestamp de início
    const startTime = Date.now();
    
    // Log da requisição
    logger.info(`[${requestId}] Request received`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        user_id: req.user?.id
    });
    
    // Interceptar a finalização da resposta
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        
        // Log baseado no status code
        const logMethod = res.statusCode >= 400 ? "warn" : "info";
        
        logger[logMethod](`[${requestId}] Request completed`, {
            method: req.method,
            url: req.originalUrl,
            status_code: res.statusCode,
            duration_ms: duration,
            user_id: req.user?.id
        });
    });
    
    next();
}
```

## 6. Configuração e Variáveis de Ambiente

```typescript
// src/config/env.ts
import dotenv from "dotenv";
import path from "path";

// Carrega variáveis de ambiente apropriadas
const env = process.env.NODE_ENV || "development";
dotenv.config({
    path: path.resolve(__dirname, `../../.env.${env}`)
});

// Configuração validada com valores padrão
export default {
    // Servidor
    PORT: parseInt(process.env.PORT || "3000", 10),
    NODE_ENV: env,
    
    // Banco de dados
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    
    // Autenticação
    JWT_SECRET: process.env.JWT_SECRET || "default-dev-secret",
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1d",
    SYNC_SECRET_KEY: process.env.SYNC_SECRET_KEY || "default-sync-secret",
    
    // Redis (para cache)
    REDIS_URL: process.env.REDIS_URL,
    
    // Filas
    QUEUE_URL: process.env.QUEUE_URL,
    
    // Limites e taxas
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || "100", 10),
    API_RATE_WINDOW_MS: parseInt(process.env.API_RATE_WINDOW_MS || "900000", 10), // 15 min
    
    // Configurações de log
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    
    // Integrações de monitoramento
    SENTRY_DSN: process.env.SENTRY_DSN
};
```

## 7. Segurança Avançada

### 7.1. Validação de Entrada

Além do middleware de validação com Joi, a aplicação implementa:

```typescript
// src/validations/sync.validation.ts
import Joi from "joi";

export const syncEventsSchema = Joi.object({
    deviceId: Joi.string().uuid().required(),
    userId: Joi.string().uuid().required(),
    clientVersion: Joi.string().required(),
    events: Joi.array().items(
        Joi.object({
            id: Joi.string().uuid().required(),
            package_name: Joi.string().required(),
            app_name: Joi.string().required(),
            start_time: Joi.date().iso().required(),
            end_time: Joi.date().iso().required(),
            foreground: Joi.boolean().required(),
            category: Joi.string().required(),
            metadata: Joi.object().default({})
        })
    ).min(1).required(),
    hash: Joi.string().required()
}).required();
```

### 7.2. Prevenção contra Ataques Comuns

```typescript
// src/middlewares/security.middleware.ts
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { Express } from "express";
import xss from "xss-clean";
import hpp from "hpp";

export function configureSecurityMiddleware(app: Express): void {
    // Proteção de cabeçalhos HTTP
    app.use(helmet());
    
    // Configuração de CORS
    app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }));
    
    // Proteção contra XSS
    app.use(xss());
    
    // Proteção contra Pollution de Parâmetros HTTP
    app.use(hpp());
    
    // Prevenir MIME sniffing
    app.use((req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        next();
    });
    
    // Prevenir clickjacking
    app.use((req, res, next) => {
        res.setHeader("X-Frame-Options", "DENY");
        next();
    });
}
```

### 7.3. Rate Limiting e Throttling

```typescript
// src/middlewares/rate-limit.middleware.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import config from "../config/env";

const redis = new Redis(config.REDIS_URL);

export const apiLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: "rate-limit:"
    }),
    windowMs: config.API_RATE_WINDOW_MS, // 15 minutos
    max: config.API_RATE_LIMIT, // 100 requisições por 15 minutos
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use IP + device_id ou user_id se disponível
        return req.user?.id 
            ? `${req.ip}:${req.user.id}`
            : req.ip;
    },
    handler: (req, res) => {
        res.status(429).json({
            error: "TooManyRequests",
            message: "Rate limit exceeded, please try again later",
            retry_after: Math.ceil(config.API_RATE_WINDOW_MS / 1000)
        });
    }
});

// Limitador mais restritivo para rotas sensíveis
export const authLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: "auth-limit:"
    }),
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por 15 minutos
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        res.status(429).json({
            error: "TooManyRequests",
            message: "Too many authentication attempts, please try again later",
            retry_after: 15 * 60
        });
    }
});
```

## 8. Estratégias de Cache (Servidor)

### 8.1. Cache de Respostas da API

```typescript
// src/middlewares/cache.middleware.ts
import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import config from "../config/env";

const redis = new Redis(config.REDIS_URL);

interface CacheOptions {
    ttl?: number; // Tempo de vida em segundos
    keyPrefix?: string;
}

/**
 * Middleware para cache de respostas da API
 */
export function cacheResponse(options: CacheOptions = {}) {
    const ttl = options.ttl || 300; // Padrão: 5 minutos
    const keyPrefix = options.keyPrefix || "api-cache:";
    
    return async (req
```

### 8.2. Cache de Dados Agregados/Processados

```typescript
// src/services/CacheService.ts
import Redis from "ioredis";
import config from "../config/env";

const redis = new Redis(config.REDIS_URL);

export class CacheService {
    private prefix: string;
    
    constructor(prefix = "app:") {
        this.prefix = prefix;
    }
    
    /**
     * Recupera dados em cache ou executa uma função para gerar os dados
     */
    async getOrSet<T>(
        key: string, 
        dataFn: () => Promise<T>, 
        ttl: number = 3600 // 1 hora por padrão
    ): Promise<T> {
        const cacheKey = `${this.prefix}${key}`;
        
        try {
            // Verifica se existe em cache
            const cachedData = await redis.get(cacheKey);
            
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            
            // Gera e armazena os dados
            const data = await dataFn();
            await redis.set(cacheKey, JSON.stringify(data), "EX", ttl);
            
            return data;
        } catch (error) {
            console.error(`Cache error for key ${cacheKey}:`, error);
            // Em caso de erro de cache, executa a função diretamente
            return dataFn();
        }
    }
    
    /**
     * Invalida uma chave específica
     */
    async invalidate(key: string): Promise<void> {
        await redis.del(`${this.prefix}${key}`);
    }
    
    /**
     * Invalida múltiplas chaves usando padrão glob
     */
    async invalidatePattern(pattern: string): Promise<void> {
        const keys = await redis.keys(`${this.prefix}${pattern}`);
        
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
    
    /**
     * Uso específico: cache de dados processados de uso de aplicativo
     */
    async cacheUserUsageStats(userId: string, data: any, days: number = 7): Promise<void> {
        const key = `user:${userId}:usage:${days}days`;
        await redis.set(`${this.prefix}${key}`, JSON.stringify(data), "EX", 1800); // 30 minutos
    }
    
    async getUserUsageStats(userId: string, days: number = 7): Promise<any | null> {
        const key = `user:${userId}:usage:${days}days`;
        const data = await redis.get(`${this.prefix}${key}`);
        return data ? JSON.parse(data) : null;
    }
}
```

## 9. Tratamento de Erros Global

### 9.1. Classes de Erro Customizadas

```typescript
// src/errors/index.ts
export abstract class BaseError extends Error {
    public readonly statusCode: number;
    public readonly details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends BaseError {
    constructor(message: string = "Bad request", details?: any) {
        super(message, 400, details);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string = "Unauthorized", details?: any) {
        super(message, 401, details);
    }
}

export class ForbiddenError extends BaseError {
    constructor(message: string = "Forbidden", details?: any) {
        super(message, 403, details);
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string = "Resource not found", details?: any) {
        super(message, 404, details);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string = "Conflict", details?: any) {
        super(message, 409, details);
    }
}

export class InternalServerError extends BaseError {
    constructor(message: string = "Internal server error", details?: any) {
        super(message, 500, details);
    }
}

export class ServiceUnavailableError extends BaseError {
    constructor(message: string = "Service unavailable", details?: any) {
        super(message, 503, details);
    }
}
```

### 9.2. Estrutura de Resposta de Erro da API

```typescript
// src/utils/api-response.ts
import { Response } from "express";

export interface ApiErrorResponse {
    error: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id?: string;
}

export interface ApiSuccessResponse<T> {
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        [key: string]: any;
    };
}

export class ApiResponse {
    /**
     * Formata resposta de sucesso
     */
    static success<T>(
        res: Response, 
        data: T, 
        statusCode: number = 200, 
        meta?: object
    ): Response {
        const response: ApiSuccessResponse<T> = {
            data
        };
        
        if (meta) {
            response.meta = meta;
        }
        
        return res.status(statusCode).json(response);
    }
    
    /**
     * Formata resposta de erro
     */
    static error(
        res: Response,
        error: string,
        message: string,
        statusCode: number = 500,
        details?: any
    ): Response {
        const errorResponse: ApiErrorResponse = {
            error,
            message,
            timestamp: new Date().toISOString(),
            request_id: res.locals.requestId
        };
        
        if (details) {
            errorResponse.details = details;
        }
        
        return res.status(statusCode).json(errorResponse);
    }
}
```

## 10. Logging e Monitoramento (Servidor)

### 10.1. Formato dos Logs

```typescript
// src/utils/logger.ts
import winston from "winston";
import { format } from "winston";
import config from "../config/env";

// Formata mensagens de log para saída
const customFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Configurações do logger
export const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: customFormat,
    defaultMeta: { service: "conexao-saudavel-api" },
    transports: [
        // Console sempre presente para desenvolvimento e logs básicos
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ timestamp, level, message, service, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? 
                        `\n${JSON.stringify(meta, null, 2)}` : '';
                    return `[${timestamp}] ${service} ${level}: ${message}${metaStr}`;
                })
            )
        })
    ]
});

// Em produção, adiciona transporte de arquivo
if (config.NODE_ENV === "production") {
    logger.add(new winston.transports.File({ 
        filename: "logs/error.log", 
        level: "error",
        maxsize: 10485760, // 10MB
        maxFiles: 5
    }));
    
    logger.add(new winston.transports.File({ 
        filename: "logs/combined.log",
        maxsize: 10485760, // 10MB
        maxFiles: 5
    }));
}

// Integração com Sentry para produção
if (config.NODE_ENV === "production" && config.SENTRY_DSN) {
    const Sentry = require("@sentry/node");
    Sentry.init({
        dsn: config.SENTRY_DSN,
        environment: config.NODE_ENV,
        tracesSampleRate: 0.2,
    });
    
    // Middleware para integrar logs com Sentry
    logger.on("error", (error) => {
        Sentry.captureException(error);
    });
}
```

### 10.2. Métricas Chave do Servidor

```typescript
// src/utils/metrics.ts
import promClient from "prom-client";
import { Request, Response, NextFunction } from "express";

// Cria um registro padrão
const register = new promClient.Registry();

// Adicionar métricas padrão do Node.js
promClient.collectDefaultMetrics({ register });

// Contador de requisições HTTP
const httpRequestsTotal = new promClient.Counter({
    name: "http_requests_total",
    help: "Total de requisições HTTP recebidas",
    labelNames: ["method", "path", "status"]
});

// Histograma de duração de requisições
const httpRequestDurationMs = new promClient.Histogram({
    name: "http_request_duration_ms",
    help: "Duração das requisições HTTP em milissegundos",
    labelNames: ["method", "path", "status"],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
});

// Contador de erros
const errorTotal = new promClient.Counter({
    name: "error_total",
    help: "Total de erros ocorridos",
    labelNames: ["type"]
});

// Contador de sincronizações
const syncTotal = new promClient.Counter({
    name: "sync_total",
    help: "Total de sincronizações realizadas",
    labelNames: ["status"]
});

// Gauge para número de usuários ativos
const activeUsersGauge = new promClient.Gauge({
    name: "active_users",
    help: "Número de usuários ativos no sistema"
});

// Registrar todas as métricas
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationMs);
register.registerMetric(errorTotal);
register.registerMetric(syncTotal);
register.registerMetric(activeUsersGauge);

// Middleware para registrar métricas em cada requisição
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    // Interceptar o evento de finalização
    res.on("finish", () => {
        const duration = Date.now() - start;
        const path = req.route ? req.route.path : req.path;
        
        httpRequestsTotal.inc({
            method: req.method,
            path,
            status: res.statusCode
        });
        
        httpRequestDurationMs.observe({
            method: req.method,
            path,
            status: res.statusCode
        }, duration);
        
        // Registrar erros
        if (res.statusCode >= 400) {
            errorTotal.inc({
                type: res.statusCode >= 500 ? "server" : "client"
            });
        }
    });
    
    next();
}

// Endpoints para métricas Prometheus
export function metricsEndpoint(req: Request, res: Response): void {
    res.set("Content-Type", register.contentType);
    register.metrics().then(metrics => res.send(metrics));
}

export const metrics = {
    errorTotal,
    syncTotal,
    activeUsersGauge
};
```

## 11. Tarefas em Background / Filas

```typescript
// src/queue/index.ts
import Bull from "bull";
import config from "../config/env";
import { processDailyReport } from "./processors/dailyReportProcessor";
import { processWeeklyReport } from "./processors/weeklyReportProcessor";
import { processNotifications } from "./processors/notificationsProcessor";
import { processDataAnalytics } from "./processors/dataAnalyticsProcessor";
import { logger } from "../utils/logger";

// Configurações comuns para as filas
const defaultOptions = {
    redis: config.REDIS_URL,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000
        },
        removeOnComplete: 100, // Manter apenas 100 jobs concluídos
        removeOnFail: 200 // Manter mais jobs falhados para diagnóstico
    }
};

// Filas da aplicação
export const dailyReportsQueue = new Bull("daily-reports", defaultOptions);
export const weeklyReportsQueue = new Bull("weekly-reports", defaultOptions);
export const notificationsQueue = new Bull("notifications", defaultOptions);
export const dataAnalyticsQueue = new Bull("data-analytics", defaultOptions);

// Inicialização das filas
export async function initializeQueues() {
    // Registrar processadores
    dailyReportsQueue.process(processDailyReport);
    weeklyReportsQueue.process(processWeeklyReport);
    notificationsQueue.process(processNotifications);
    dataAnalyticsQueue.process(processDataAnalytics);
    
    // Lidar com eventos de erro
    const queues = [dailyReportsQueue, weeklyReportsQueue, notificationsQueue, dataAnalyticsQueue];
    
    queues.forEach(queue => {
        queue.on("error", (error) => {
            logger.error(`Queue ${queue.name} error:`, error);
        });
        
        queue.on("failed", (job, error) => {
            logger.error(`Job ${job.id} in ${queue.name} failed:`, { 
                error: error.message,
                stack: error.stack,
                jobData: job.data
            });
        });
        
        logger.info(`Queue ${queue.name} initialized`);
    });
    
    return queues;
}

// Exemplos de trabalhos agendados
export function scheduleRecurringJobs() {
    // Gerar relatórios diários - todos os dias às 00:30
    dailyReportsQueue.add(
        { type: "generate_all" },
        { 
            repeat: { cron: "30 0 * * *" },
            jobId: "daily-reports-all"
        }
    );
    
    // Gerar relatórios semanais - todas as segundas às 01:00
    weeklyReportsQueue.add(
        { type: "generate_all" },
        { 
            repeat: { cron: "0 1 * * 1" },
            jobId: "weekly-reports-all"
        }
    );
    
    // Análise de dados diária - todos os dias às 03:00
    dataAnalyticsQueue.add(
        { type: "daily_institution_analytics" },
        { 
            repeat: { cron: "0 3 * * *" },
            jobId: "institution-analytics"
        }
    );
}
```

Exemplo de processador de fila:

```typescript
// src/queue/processors/dailyReportProcessor.ts
import { Job } from "bull";
import { getCustomRepository } from "typeorm";
import { UserRepository, AppUsageRepository, DailySummaryRepository } from "../../repositories";
import { DailySummary } from "../../entities";
import { logger } from "../../utils/logger";
import { formatISO, subDays } from "date-fns";

export async function processDailyReport(job: Job): Promise<any> {
    const { userId, date, type } = job.data;
    logger.info(`Processing daily report job`, { userId, date, type });
    
    try {
        // Para um usuário específico ou todos
        if (type === "generate_all") {
            return await processAllUsers();
        } else {
            return await processUserReport(userId, date);
        }
    } catch (error) {
        logger.error("Error processing daily report", {
            error: error.message,
            userId,
            date
        });
        throw error; // Propaga o erro para Bull lidar com retry
    }
}

async function processAllUsers(): Promise<any> {
    const userRepository = getCustomRepository(UserRepository);
    const users = await userRepository.find({ where: { active: true } });
    
    const yesterday = formatISO(subDays(new Date(), 1), { representation: "date" });
    logger.info(`Processing daily reports for ${users.length} users for date ${yesterday}`);
    
    const results = [];
    
    for (const user of users) {
        try {
            const result = await processUserReport(user.id, yesterday);
            results.push({ userId: user.id, success: true, result });
        } catch (error) {
            logger.error(`Failed to process daily report for user ${user.id}`, { error });
            results.push({ userId: user.id, success: false, error: error.message });
        }
    }
    
    return { processedCount: results.length, results };
}

async function processUserReport(userId: string, date: string): Promise<DailySummary> {
    const appUsageRepository = getCustomRepository(AppUsageRepository);
    const dailySummaryRepository = getCustomRepository(DailySummaryRepository);
    
    // Verificar se já existe um resumo para esta data
    const existingSummary = await dailySummaryRepository.findOne({
        where: { user_id: userId, date }
    });
    
    if (existingSummary) {
        logger.info(`Daily summary already exists for user ${userId} on ${date}`);
        return existingSummary;
    }
    
    // Buscar dados de uso para o dia específico
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    
    const usageData = await appUsageRepository.find({
        where: {
            user_id: userId,
            start_time: { $gte: startOfDay, $lte: endOfDay }
        }
    });
    
    // Calcular métricas e insights
    const totalUsageSeconds = usageData.reduce((total, usage) => total + usage.duration_seconds, 0);
    
    // Agrupar por aplicativo
    const appBreakdown = {};
    const categoryBreakdown = {};
    
    usageData.forEach(usage => {
        // Por app
        if (!appBreakdown[usage.package_name]) {
            appBreakdown[usage.package_name] = {
                app_name: usage.app_name,
                duration_seconds: 0,
                foreground_seconds: 0
            };
        }
        
        appBreakdown[usage.package_name].duration_seconds += usage.duration_seconds;
        
        if (usage.foreground) {
            appBreakdown[usage.package_name].foreground_seconds += usage.duration_seconds; 
        }
        
        // Por categoria
        if (!categoryBreakdown[usage.category]) {
            categoryBreakdown[usage.category] = 0;
        }
        
        categoryBreakdown[usage.category] += usage.duration_seconds;
    });
    
    // Encontrar o app mais usado
    let mostUsedApp = null;
    let maxDuration = 0;
    
    Object.entries(appBreakdown).forEach(([packageName, data]) => {
        const { foreground_seconds } = data as any;
        if (foreground_seconds > maxDuration) {
            mostUsedApp = packageName;
            maxDuration = foreground_seconds;
        }
    });
    
    // Encontrar categoria mais usada
    let mostUsedCategory = null;
    maxDuration = 0;
    
    Object.entries(categoryBreakdown).forEach(([category, duration]) => {
        if (duration > maxDuration) {
            mostUsedCategory = category;
            maxDuration = duration as number;
        }
    });
    
    // TODO: Implementar cálculo real de goal_completion
    const goalCompletion = 0.85; // Placeholder
    
    // Criar o resumo diário
    const dailySummary = dailySummaryRepository.create({
        user_id: userId,
        date,
        total_usage_seconds: totalUsageSeconds,
        app_breakdown: appBreakdown,
        goal_completion: goalCompletion,
        achievement_count: 0, // Será atualizado pelo serviço de achievements
        streak_count: 0, // Será atualizado posteriormente
        most_used_app: mostUsedApp,
        most_used_category: mostUsedCategory,
        insights: generateInsights(appBreakdown, categoryBreakdown, totalUsageSeconds)
    });
    
    await dailySummaryRepository.save(dailySummary);
    logger.info(`Created daily summary for user ${userId} on ${date}`);
    
    return dailySummary;
}

function generateInsights(appBreakdown, categoryBreakdown, totalUsageSeconds): string {
    // Implementação simplificada
    const insights = [];
    
    if (totalUsageSeconds > 4 * 3600) { // Mais de 4 horas
        insights.push("Uso elevado de dispositivos hoje.");
    }
    
    // Mais insights podem ser adicionados aqui com base em diversos critérios
    
    return insights.join(" ");
}
```
