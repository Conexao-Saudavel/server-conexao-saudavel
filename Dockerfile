FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./

# Configura npm para mostrar mais informações
ENV NPM_CONFIG_LOGLEVEL=verbose
ENV NPM_CONFIG_PROGRESS=true

# Instala dependências com mais informações de debug
RUN echo "Iniciando instalação de dependências..." && \
    npm install --omit=dev --no-package-lock --ignore-scripts --verbose && \
    echo "Dependências instaladas com sucesso!"

# Copia o código fonte
COPY . .

# Compila o TypeScript com mais informações
RUN echo "Iniciando compilação do TypeScript..." && \
    npm run build && \
    echo "TypeScript compilado com sucesso!"

# Configura variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Configura logs mais detalhados
ENV LOG_LEVEL=debug
ENV LOG_FORMAT=json

EXPOSE ${PORT:-3000}

# Usa o script start para produção
CMD ["npm", "start"] 