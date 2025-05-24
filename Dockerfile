FROM node:20-alpine

WORKDIR /app

# Instala dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia o código fonte
COPY . .

# Compila o TypeScript e executa as migrações
RUN npm run build && \
    npm run migration:run:prod

# Configura variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Expõe a porta
EXPOSE ${PORT:-3000}

# Comando para iniciar a aplicação
CMD ["npm", "start"] 