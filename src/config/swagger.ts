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
                url: process.env.API_URL || 'http://localhost:3000',
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
                            description: 'Nome do erro'
                        },
                        message: {
                            type: 'string',
                            description: 'Mensagem descritiva do erro'
                        },
                        details: {
                            type: 'object',
                            description: 'Detalhes adicionais do erro'
                        }
                    }
                },
                UserType: {
                    type: 'string',
                    enum: ['adolescente', 'responsavel', 'profissional'],
                    description: 'Tipo de usuário no sistema'
                },
                Gender: {
                    type: 'string',
                    enum: ['masculino', 'feminino', 'outro'],
                    description: 'Gênero do usuário'
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