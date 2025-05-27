import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Conexão Saudável',
            version: '1.0.0',
            description: 'API para o sistema Conexão Saudável - Monitoramento e Gestão de Uso de Dispositivos',
            contact: {
                name: 'Equipe Conexão Saudável',
                email: 'contato@conexaosaudavel.com.br'
            }
        },
        servers: [
            {
                url: `${process.env.API_URL || 'http://localhost:3000'}/api`,
                description: 'Servidor de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Tipo do erro'
                        },
                        message: {
                            type: 'string',
                            description: 'Mensagem de erro'
                        },
                        details: {
                            type: 'string',
                            description: 'Detalhes adicionais do erro (opcional)'
                        }
                    }
                },
                UserType: {
                    type: 'string',
                    enum: ['independente', 'institucional', 'aluno'],
                    description: 'Tipo de usuário no sistema'
                },
                Gender: {
                    type: 'string',
                    enum: ['masculino', 'feminino', 'outro'],
                    description: 'Gênero do usuário'
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID único do usuário'
                        },
                        username: {
                            type: 'string',
                            description: 'Nome de usuário (apenas letras, números e underscore)',
                            minLength: 3,
                            maxLength: 30,
                            pattern: '^[a-zA-Z0-9_]+$'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        },
                        full_name: {
                            type: 'string',
                            description: 'Nome completo do usuário',
                            minLength: 3,
                            maxLength: 100
                        },
                        date_of_birth: {
                            type: 'string',
                            format: 'date',
                            description: 'Data de nascimento (não pode ser futura)'
                        },
                        gender: {
                            type: 'string',
                            enum: ['masculino', 'feminino', 'outro'],
                            description: 'Gênero do usuário',
                            example: 'masculino'
                        },
                        user_type: {
                            type: 'string',
                            enum: ['independente', 'institucional', 'aluno'],
                            description: 'Tipo de usuário (independente - Usuário independente, institucional - Usuário institucional, aluno - Aluno)',
                            example: 'independente'
                        },
                        institution_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID da instituição do usuário (opcional)',
                            nullable: true
                        },
                        active: {
                            type: 'boolean',
                            description: 'Status de ativação do usuário'
                        },
                        onboarding_completed: {
                            type: 'boolean',
                            description: 'Status de conclusão do onboarding'
                        },
                        settings: {
                            type: 'object',
                            description: 'Configurações do usuário',
                            default: {}
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data de criação do usuário'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data da última atualização do usuário'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'username', 'password', 'confirm_password', 'full_name', 'date_of_birth', 'gender'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário',
                            example: 'joao@exemplo.com'
                        },
                        username: {
                            type: 'string',
                            description: 'Nome de usuário (apenas letras, números e underscore)',
                            minLength: 3,
                            maxLength: 30,
                            pattern: '^[a-zA-Z0-9_]+$',
                            example: 'joao_silva'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Senha (mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial)',
                            minLength: 8,
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                            example: 'Senha@123'
                        },
                        confirm_password: {
                            type: 'string',
                            format: 'password',
                            description: 'Confirmação da senha (deve ser igual à senha)',
                            example: 'Senha@123'
                        },
                        full_name: {
                            type: 'string',
                            description: 'Nome completo do usuário',
                            minLength: 3,
                            maxLength: 100,
                            example: 'João Silva'
                        },
                        date_of_birth: {
                            type: 'string',
                            format: 'date',
                            description: 'Data de nascimento (não pode ser futura)',
                            example: '1990-01-01'
                        },
                        gender: {
                            type: 'string',
                            enum: ['masculino', 'feminino', 'outro'],
                            description: 'Gênero do usuário',
                            example: 'masculino'
                        },
                        institution_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID da instituição (opcional - pode ser associado posteriormente)',
                            example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            nullable: true
                        },
                        user_type: {
                            type: 'string',
                            enum: ['independente', 'institucional', 'aluno'],
                            description: 'Tipo de usuário (independente - Usuário independente, institucional - Usuário institucional, aluno - Aluno). Por padrão será "independente" se não especificado.',
                            example: 'independente',
                            default: 'independente'
                        },
                        settings: {
                            type: 'object',
                            description: 'Configurações opcionais do usuário',
                            default: {},
                            example: {
                                notifications: {
                                    email: true,
                                    push: true
                                },
                                theme: 'light'
                            }
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário',
                            example: 'joao@exemplo.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Senha do usuário',
                            example: 'Senha@123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID do usuário'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário'
                        },
                        username: {
                            type: 'string',
                            description: 'Nome de usuário'
                        },
                        full_name: {
                            type: 'string',
                            description: 'Nome completo'
                        },
                        user_type: {
                            type: 'string',
                            enum: ['independente', 'institucional', 'aluno'],
                            description: 'Tipo de usuário'
                        },
                        institution_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID da instituição',
                            nullable: true
                        },
                        access_token: {
                            type: 'string',
                            description: 'Token de acesso JWT'
                        },
                        refresh_token: {
                            type: 'string',
                            description: 'Token de atualização JWT'
                        }
                    }
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refresh_token'],
                    properties: {
                        refresh_token: {
                            type: 'string',
                            description: 'Token de atualização JWT'
                        }
                    }
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email do usuário',
                            example: 'joao@exemplo.com'
                        }
                    }
                },
                ResetPasswordRequest: {
                    type: 'object',
                    required: ['token', 'new_password', 'confirm_password'],
                    properties: {
                        token: {
                            type: 'string',
                            description: 'Token de redefinição de senha'
                        },
                        new_password: {
                            type: 'string',
                            format: 'password',
                            description: 'Nova senha',
                            minLength: 6
                        },
                        confirm_password: {
                            type: 'string',
                            format: 'password',
                            description: 'Confirmação da nova senha',
                            minLength: 6
                        }
                    }
                },
                Institution: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID único da instituição'
                        },
                        name: {
                            type: 'string',
                            description: 'Nome da instituição',
                            example: 'Escola Municipal São Paulo'
                        },
                        cnpj: {
                            type: 'string',
                            description: 'CNPJ da instituição',
                            example: '12345678901234'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email da instituição',
                            example: 'contato@escolasaopaulo.edu.br'
                        },
                        phone: {
                            type: 'string',
                            description: 'Telefone da instituição',
                            example: '11999999999'
                        },
                        address: {
                            type: 'string',
                            description: 'Endereço da instituição',
                            example: 'Rua das Flores, 123'
                        },
                        city: {
                            type: 'string',
                            description: 'Cidade da instituição',
                            example: 'São Paulo'
                        },
                        state: {
                            type: 'string',
                            description: 'Estado da instituição',
                            example: 'SP'
                        },
                        country: {
                            type: 'string',
                            description: 'País da instituição',
                            example: 'Brasil'
                        },
                        postal_code: {
                            type: 'string',
                            description: 'CEP da instituição',
                            example: '01234567'
                        },
                        active: {
                            type: 'boolean',
                            description: 'Status de ativação da instituição',
                            example: true
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data de criação da instituição'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Data da última atualização da instituição'
                        }
                    }
                }
            },
            paths: {
                '/auth/login': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Autentica um usuário',
                        description: 'Realiza o login do usuário e retorna os tokens de acesso',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/LoginRequest'
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Login realizado com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/AuthResponse'
                                        }
                                    }
                                }
                            },
                            '401': {
                                description: 'Credenciais inválidas',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/Error'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/auth/register': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Registra um novo usuário',
                        description: 'Cria uma nova conta de usuário',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/RegisterRequest'
                                    }
                                }
                            }
                        },
                        responses: {
                            '201': {
                                description: 'Usuário registrado com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/AuthResponse'
                                        }
                                    }
                                }
                            },
                            '400': {
                                description: 'Dados inválidos',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/Error'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/auth/refresh': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Atualiza o token de acesso',
                        description: 'Gera um novo par de tokens usando o refresh token',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/RefreshTokenRequest'
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Tokens atualizados com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                access_token: {
                                                    type: 'string',
                                                    description: 'Novo token de acesso JWT'
                                                },
                                                refresh_token: {
                                                    type: 'string',
                                                    description: 'Novo token de atualização JWT'
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            '401': {
                                description: 'Token inválido',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/Error'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/auth/forgot-password': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Solicita recuperação de senha',
                        description: 'Envia um email com instruções para redefinir a senha',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ForgotPasswordRequest'
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Email de recuperação enviado',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                message: {
                                                    type: 'string',
                                                    description: 'Mensagem de sucesso'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '/auth/reset-password': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Redefine a senha do usuário',
                        description: 'Atualiza a senha do usuário usando o token de redefinição',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ResetPasswordRequest'
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': {
                                description: 'Senha atualizada com sucesso',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                message: {
                                                    type: 'string',
                                                    description: 'Mensagem de sucesso'
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            '400': {
                                description: 'Token inválido ou senhas não coincidem',
                                content: {
                                    'application/json': {
                                        schema: {
                                            $ref: '#/components/schemas/Error'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.ts'], // Caminho para os arquivos de rota
};

export const swaggerSpec = swaggerJsdoc(options); 