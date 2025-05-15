import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';

export function setupSwagger(app: Express): void {
    // Rota para a documentação Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Conexão Saudável - API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showCommonExtensions: true,
            showExtensions: true,
            showRequestDuration: true,
            syntaxHighlight: {
                theme: 'monokai'
            }
        }
    }));

    // Rota para o arquivo JSON do Swagger
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
} 