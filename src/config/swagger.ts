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
                            example: 'joao@escolasaopaulo.edu.br'
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
                        user: {
                            $ref: '#/components/schemas/User'
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
                '/auth/register': {
                    post: {
                        tags: ['Autenticação'],
                        summary: 'Registrar novo usuário',
                        description: 'Endpoint para registro de novos usuários. Por padrão, os usuários são registrados como "independente" e podem ser associados a uma instituição posteriormente.',
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/RegisterRequest'
                                    },
                                    examples: {
                                        'Usuario Independente': {
                                            value: {
                                                email: 'joao@exemplo.com',
                                                username: 'joao_silva',
                                                password: 'Senha@123',
                                                confirm_password: 'Senha@123',
                                                full_name: 'João Silva',
                                                date_of_birth: '1990-01-01',
                                                gender: 'masculino'
                                            }
                                        },
                                        'Usuario com Instituição': {
                                            value: {
                                                email: 'maria@escola.edu.br',
                                                username: 'maria_aluno',
                                                password: 'Senha@123',
                                                confirm_password: 'Senha@123',
                                                full_name: 'Maria Santos',
                                                date_of_birth: '2005-05-15',
                                                gender: 'feminino',
                                                institution_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                                                user_type: 'aluno'
                                            }
                                        }
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