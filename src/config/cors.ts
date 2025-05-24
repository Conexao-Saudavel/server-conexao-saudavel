import cors from 'cors';
import config from './env.js';

// Lista de origens permitidas
const allowedOrigins = config.ALLOWED_ORIGINS 
  ? config.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

// Configuração do CORS
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origem (como mobile apps ou curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

// Middleware do CORS
export const corsMiddleware = cors(corsOptions); 