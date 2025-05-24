import helmet from 'helmet';
import config from './env.js';

// Configuração do Helmet com opções de segurança avançadas
export const helmetConfig = helmet({
  // Proteção contra XSS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  
  // Previne clickjacking
  frameguard: {
    action: 'deny'
  },
  
  // Força HTTPS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // Desativa o header X-Powered-By
  hidePoweredBy: true,
  
  // Previne MIME type sniffing
  noSniff: true,
  
  // Previne XSS em navegadores antigos
  xssFilter: true,
  
  // Previne DNS prefetching
  dnsPrefetchControl: {
    allow: false
  },
  
  // Previne IE de executar downloads
  ieNoOpen: true,
  
  // Previne referrer leakage
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  // Previne cross-origin embedding
  crossOriginEmbedderPolicy: true,
  
  // Previne cross-origin opener
  crossOriginOpenerPolicy: {
    policy: 'same-origin'
  },
  
  // Previne cross-origin resource policy
  crossOriginResourcePolicy: {
    policy: 'same-site'
  },
  
  // Permite apenas origens específicas
  originAgentCluster: true,
  
  // Permite apenas políticas de domínio específicas
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
}); 